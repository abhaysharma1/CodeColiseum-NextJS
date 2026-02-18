class PerformanceMetrics {
  constructor() {
    this.reset();
  }

  reset() {
    this.requests = [];
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.byEndpoint = new Map();
    this.byUser = new Map();
    this.responseTimes = [];
  }

  startTest() {
    this.startTime = Date.now();
    console.log(`🚀 Starting stress test at ${new Date().toISOString()}`);
  }

  endTest() {
    this.endTime = Date.now();
    console.log(`🏁 Ending stress test at ${new Date().toISOString()}`);
  }

  recordRequest(endpoint, method, startTime, endTime, success, status, error = null, userId = null) {
    const duration = endTime - startTime;
    const requestRecord = {
      endpoint,
      method,
      startTime,
      endTime,
      duration,
      success,
      status,
      error,
      userId,
      timestamp: new Date().toISOString()
    };

    this.requests.push(requestRecord);
    this.responseTimes.push(duration);
    this.totalRequests++;

    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
      this.errors.push(requestRecord);
    }

    // Track by endpoint
    const endpointKey = `${method} ${endpoint}`;
    if (!this.byEndpoint.has(endpointKey)) {
      this.byEndpoint.set(endpointKey, {
        total: 0,
        successful: 0,
        failed: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        responseTimes: []
      });
    }
    
    const endpointStats = this.byEndpoint.get(endpointKey);
    endpointStats.total++;
    endpointStats.totalTime += duration;
    endpointStats.minTime = Math.min(endpointStats.minTime, duration);
    endpointStats.maxTime = Math.max(endpointStats.maxTime, duration);
    endpointStats.responseTimes.push(duration);
    
    if (success) {
      endpointStats.successful++;
    } else {
      endpointStats.failed++;
    }

    // Track by user
    if (userId) {
      if (!this.byUser.has(userId)) {
        this.byUser.set(userId, {
          total: 0,
          successful: 0,
          failed: 0,
          totalTime: 0
        });
      }
      
      const userStats = this.byUser.get(userId);
      userStats.total++;
      userStats.totalTime += duration;
      
      if (success) {
        userStats.successful++;
      } else {
        userStats.failed++;
      }
    }
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getTestDuration() {
    if (!this.startTime || !this.endTime) return 0;
    return (this.endTime - this.startTime) / 1000; // in seconds
  }

  getThroughput() {
    const durationSeconds = this.getTestDuration();
    return durationSeconds > 0 ? this.totalRequests / durationSeconds : 0;
  }

  getErrorRate() {
    return this.totalRequests > 0 ? this.failedRequests / this.totalRequests : 0;
  }

  getAverageResponseTime() {
    return this.responseTimes.length > 0 ? 
           this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length : 0;
  }

  getResponseTimeStats() {
    if (this.responseTimes.length === 0) return null;
    
    return {
      min: Math.min(...this.responseTimes),
      max: Math.max(...this.responseTimes),
      mean: this.getAverageResponseTime(),
      median: this.calculatePercentile(this.responseTimes, 50),
      p75: this.calculatePercentile(this.responseTimes, 75),
      p90: this.calculatePercentile(this.responseTimes, 90),
      p95: this.calculatePercentile(this.responseTimes, 95),
      p99: this.calculatePercentile(this.responseTimes, 99)
    };
  }

  getEndpointStats() {
    const stats = {};
    
    for (const [endpoint, data] of this.byEndpoint) {
      stats[endpoint] = {
        totalRequests: data.total,
        successfulRequests: data.successful,
        failedRequests: data.failed,
        successRate: data.total > 0 ? data.successful / data.total : 0,
        errorRate: data.total > 0 ? data.failed / data.total : 0,
        averageResponseTime: data.total > 0 ? data.totalTime / data.total : 0,
        minResponseTime: data.minTime === Infinity ? 0 : data.minTime,
        maxResponseTime: data.maxTime,
        throughput: this.getTestDuration() > 0 ? data.total / this.getTestDuration() : 0,
        responseTimeStats: {
          p50: this.calculatePercentile(data.responseTimes, 50),
          p75: this.calculatePercentile(data.responseTimes, 75),
          p90: this.calculatePercentile(data.responseTimes, 90),
          p95: this.calculatePercentile(data.responseTimes, 95),
          p99: this.calculatePercentile(data.responseTimes, 99)
        }
      };
    }
    
    return stats;
  }

  getUserStats() {
    const stats = {};
    
    for (const [userId, data] of this.byUser) {
      stats[userId] = {
        totalRequests: data.total,
        successfulRequests: data.successful,
        failedRequests: data.failed,
        successRate: data.total > 0 ? data.successful / data.total : 0,
        errorRate: data.total > 0 ? data.failed / data.total : 0,
        averageResponseTime: data.total > 0 ? data.totalTime / data.total : 0,
        throughput: this.getTestDuration() > 0 ? data.total / this.getTestDuration() : 0
      };
    }
    
    return stats;
  }

  getErrorsByType() {
    const errorsByStatus = {};
    const errorsByEndpoint = {};
    
    this.errors.forEach(error => {
      // Group by status code
      if (!errorsByStatus[error.status]) {
        errorsByStatus[error.status] = [];
      }
      errorsByStatus[error.status].push(error);
      
      // Group by endpoint
      const endpoint = `${error.method} ${error.endpoint}`;
      if (!errorsByEndpoint[endpoint]) {
        errorsByEndpoint[endpoint] = [];
      }
      errorsByEndpoint[endpoint].push(error);
    });
    
    return {
      byStatus: errorsByStatus,
      byEndpoint: errorsByEndpoint
    };
  }

  getSummaryReport() {
    const duration = this.getTestDuration();
    const responseStats = this.getResponseTimeStats();
    const errorRate = this.getErrorRate();
    const throughput = this.getThroughput();
    
    return {
      overview: {
        testDuration: `${duration.toFixed(2)} seconds`,
        totalRequests: this.totalRequests,
        successfulRequests: this.successfulRequests,
        failedRequests: this.failedRequests,
        successRate: `${((1 - errorRate) * 100).toFixed(2)}%`,
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        throughput: `${throughput.toFixed(2)} requests/second`
      },
      responseTime: responseStats ? {
        average: `${responseStats.mean.toFixed(2)}ms`,
        median: `${responseStats.median.toFixed(2)}ms`,
        min: `${responseStats.min.toFixed(2)}ms`,
        max: `${responseStats.max.toFixed(2)}ms`,
        p75: `${responseStats.p75.toFixed(2)}ms`,
        p90: `${responseStats.p90.toFixed(2)}ms`,
        p95: `${responseStats.p95.toFixed(2)}ms`,
        p99: `${responseStats.p99.toFixed(2)}ms`
      } : null,
      endpoints: this.getEndpointStats(),
      users: this.getUserStats(),
      errors: this.getErrorsByType()
    };
  }

  printReport() {
    const report = this.getSummaryReport();
    
    console.log('\\n' + '='.repeat(80));
    console.log('                          STRESS TEST RESULTS');
    console.log('='.repeat(80));
    
    // Overview
    console.log('\\n📊 OVERVIEW:');
    console.log(`   Test Duration: ${report.overview.testDuration}`);
    console.log(`   Total Requests: ${report.overview.totalRequests}`);
    console.log(`   Successful: ${report.overview.successfulRequests} (${report.overview.successRate})`);
    console.log(`   Failed: ${report.overview.failedRequests} (${report.overview.errorRate})`);
    console.log(`   Throughput: ${report.overview.throughput}`);
    
    // Response Times
    if (report.responseTime) {
      console.log('\\n⏱️  RESPONSE TIMES:');
      console.log(`   Average: ${report.responseTime.average}`);
      console.log(`   Median:  ${report.responseTime.median}`);
      console.log(`   Min:     ${report.responseTime.min}`);
      console.log(`   Max:     ${report.responseTime.max}`);
      console.log(`   75th:    ${report.responseTime.p75}`);
      console.log(`   90th:    ${report.responseTime.p90}`);
      console.log(`   95th:    ${report.responseTime.p95}`);
      console.log(`   99th:    ${report.responseTime.p99}`);
    }
    
    // Top endpoints by throughput
    console.log('\\n🔗 TOP ENDPOINTS BY THROUGHPUT:');
    const sortedEndpoints = Object.entries(report.endpoints)
      .sort(([,a], [,b]) => b.throughput - a.throughput)
      .slice(0, 10);
    
    sortedEndpoints.forEach(([endpoint, stats], index) => {
      console.log(`   ${index + 1}. ${endpoint}`);
      console.log(`      Requests: ${stats.totalRequests}, Success: ${(stats.successRate * 100).toFixed(1)}%, Avg: ${stats.averageResponseTime.toFixed(0)}ms, RPS: ${stats.throughput.toFixed(1)}`);
    });
    
    // Error summary
    if (this.failedRequests > 0) {
      console.log('\\n❌ ERROR SUMMARY:');
      const errorsByStatus = Object.entries(report.errors.byStatus);
      errorsByStatus.forEach(([status, errors]) => {
        console.log(`   ${status}: ${errors.length} errors`);
      });
      
      console.log('\\n   Top failing endpoints:');
      const failingEndpoints = Object.entries(report.endpoints)
        .filter(([, stats]) => stats.failedRequests > 0)
        .sort(([,a], [,b]) => b.failedRequests - a.failedRequests)
        .slice(0, 5);
      
      failingEndpoints.forEach(([endpoint, stats]) => {
        console.log(`   - ${endpoint}: ${stats.failedRequests} failures (${(stats.errorRate * 100).toFixed(1)}% error rate)`);
      });
    }
    
    console.log('\\n' + '='.repeat(80));
  }

  exportToJson(filename = 'stress-test-results.json') {
    const report = {
      ...this.getSummaryReport(),
      detailedRequests: this.requests,
      timestamp: new Date().toISOString(),
      testConfiguration: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        duration: this.getTestDuration(),
        concurrentUsers: process.env.CONCURRENT_USERS || 10
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\\n📄 Detailed report exported to ${filename}`);
  }
}

module.exports = PerformanceMetrics;