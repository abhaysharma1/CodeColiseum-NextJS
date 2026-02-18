#!/usr/bin/env node

const config = require('./config');
const ApiClient = require('./api-client');
const PerformanceMetrics = require('./performance-metrics');
const dataGenerator = require('./data-generator');

class StressTest {
  constructor(options = {}) {
    this.baseURL = options.baseURL || config.BASE_URL;
    this.duration = (options.duration || config.TEST_DURATION_MINUTES) * 60 * 1000; // Convert to milliseconds
    this.concurrentUsers = options.concurrentUsers || config.CONCURRENT_USERS;
    this.requestDelay = options.requestDelay || config.REQUEST_DELAY_MS;
    
    this.metrics = new PerformanceMetrics();
    this.users = new Map(); // userId -> ApiClient
    this.isRunning = false;
    this.testStartTime = null;
    
    // Test data storage
    this.testData = {
      problemIds: [],
      examIds: [],
      groupIds: []
    };
  }

  async setup() {
    console.log('🔧 Setting up stress test environment...');
    
    // Create test users for different roles
    await this.createTestUsers();
    
    // Authenticate all users
    await this.authenticateUsers();
    
    // Setup test data
    await this.setupTestData();
    
    console.log(`✅ Setup complete! Ready to test with ${this.users.size} users for ${this.duration/1000} seconds`);
  }

  async createTestUsers() {
    console.log('👥 Creating test users...');
    
    const roles = ['ADMIN', 'TEACHER', 'STUDENT'];
    const usersPerRole = Math.ceil(this.concurrentUsers / roles.length);
    
    for (const role of roles) {
      for (let i = 0; i < usersPerRole && this.users.size < this.concurrentUsers; i++) {
        const userData = {
          ...dataGenerator.generateUser(role),
          email: `${role.toLowerCase()}.test.${i}@codecoliseum.test`,
          password: 'StressTest2024!'
        };
        
        const client = new ApiClient(this.baseURL);
        const userId = `${role}-${i}`;
        
        this.users.set(userId, {
          client,
          userData,
          role,
          authenticated: false
        });
      }
    }
    
    console.log(`   Created ${this.users.size} test users`);
  }

  async authenticateUsers() {
    console.log('🔐 Authenticating users...');
    
    let successful = 0;
    let failed = 0;
    
    const authPromises = Array.from(this.users.entries()).map(async ([userId, userInfo]) => {
      try {
        // First, try to sign up (in case user doesn't exist)
        await userInfo.client.signUp(userInfo.userData);
        
        // Wait a bit to avoid rate limiting
        await this.delay(100);
        
        // Then sign in
        const signInResult = await userInfo.client.signIn({
          email: userInfo.userData.email,
          password: userInfo.userData.password
        });
        
        if (signInResult && !signInResult.error) {
          userInfo.authenticated = true;
          successful++;
        } else {
          console.warn(`⚠️  Authentication failed for ${userId}:`, signInResult?.message);
          failed++;
        }
      } catch (error) {
        console.warn(`⚠️  Authentication error for ${userId}:`, error.message);
        failed++;
      }
    });
    
    await Promise.all(authPromises);
    
    console.log(`   ✅ ${successful} users authenticated successfully`);
    if (failed > 0) {
      console.log(`   ❌ ${failed} users failed to authenticate`);
    }
  }

  async setupTestData() {
    console.log('📊 Setting up test data...');
    
    // Get admin user to create test data
    const adminUser = Array.from(this.users.values()).find(u => u.role === 'ADMIN' && u.authenticated);
    
    if (adminUser) {
      try {
        // Create some test problems
        const problemData = {
          problems: Array.from({ length: 5 }, () => dataGenerator.generateProblem())
        };
        
        const result = await adminUser.client.uploadProblems(problemData);
        if (result && !result.error) {
          console.log('   ✅ Test problems created');
        }
      } catch (error) {
        console.warn('   ⚠️  Failed to create test problems:', error.message);
      }
    }
    
    // Get teacher user to create groups and exams
    const teacherUser = Array.from(this.users.values()).find(u => u.role === 'TEACHER' && u.authenticated);
    
    if (teacherUser) {
      try {
        // Create test groups
        for (let i = 0; i < 3; i++) {
          const groupData = dataGenerator.generateGroup();
          const result = await teacherUser.client.createGroup(groupData);
          if (result && !result.error && result.id) {
            this.testData.groupIds.push(result.id);
          }
          await this.delay(100);
        }
        console.log(`   ✅ Created ${this.testData.groupIds.length} test groups`);
      } catch (error) {
        console.warn('   ⚠️  Failed to create test groups:', error.message);
      }
    }
    
    console.log('   📊 Test data setup complete');
  }

  async runStressTest() {
    console.log('\\n🚀 Starting stress test...');
    
    this.isRunning = true;
    this.testStartTime = Date.now();
    this.metrics.startTest();
    
    // Start concurrent user simulations
    const userSimulations = Array.from(this.users.entries())
      .filter(([, userInfo]) => userInfo.authenticated)
      .map(([userId, userInfo]) => this.simulateUser(userId, userInfo));
    
    // Set timeout for test duration
    setTimeout(() => {
      this.isRunning = false;
    }, this.duration);
    
    // Wait for all simulations to complete or timeout
    await Promise.all(userSimulations);
    
    this.metrics.endTest();
    console.log('\\n🏁 Stress test completed!');
  }

  async simulateUser(userId, userInfo) {
    const { client, role } = userInfo;
    
    while (this.isRunning) {
      try {
        // Get available endpoints for this user role
        const availableEndpoints = this.getEndpointsForRole(role);
        
        if (availableEndpoints.length === 0) {
          await this.delay(this.requestDelay);
          continue;
        }
        
        // Pick a random endpoint
        const endpoint = availableEndpoints[Math.floor(Math.random() * availableEndpoints.length)];
        
        // Execute the request
        await this.executeEndpoint(client, endpoint, userId);
        
        // Add delay between requests
        await this.delay(this.requestDelay + Math.random() * this.requestDelay);
        
      } catch (error) {
        // Log error but continue simulation
        console.warn(`⚠️  Error in user simulation ${userId}:`, error.message);
        await this.delay(this.requestDelay * 2);
      }
    }
  }

  getEndpointsForRole(role) {
    const allEndpoints = [
      ...Object.values(config.ENDPOINTS).flat()
    ];
    
    return allEndpoints.filter(endpoint => {
      if (!endpoint.auth) return true; // Public endpoints
      if (!endpoint.roles) return true; // Any authenticated user
      return endpoint.roles.includes(role); // Role-specific endpoints
    });
  }

  async executeEndpoint(client, endpoint, userId) {
    const startTime = Date.now();
    let result = null;
    
    try {
      // Execute based on endpoint path
      switch (endpoint.path) {
        // Auth endpoints
        case '/api/auth/session':
          result = await client.getSession();
          break;
        
        // Problem endpoints
        case '/api/problems/getproblems':
          result = await client.getProblems({
            searchValue: dataGenerator.generateRandomSearchQuery(),
            difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)],
            ...dataGenerator.generatePaginationParams()
          });
          break;
        
        case '/api/problems/submitcode':
          result = await client.submitCode({
            problemId: this.getRandomProblemId(),
            ...dataGenerator.generateSubmission()
          });
          break;
        
        case '/api/problems/runcode':
          result = await client.runCode({
            problemId: this.getRandomProblemId(),
            ...dataGenerator.generateSubmission()
          });
          break;
        
        case '/api/problems/getsubmissions':
          result = await client.getSubmissions(this.getRandomProblemId());
          break;
        
        case '/api/problems/getTemplateCode':
          result = await client.getTemplateCode(
            ['javascript', 'python', 'cpp', 'java'][Math.floor(Math.random() * 4)],
            this.getRandomProblemId()
          );
          break;
        
        // Teacher endpoints
        case '/api/teacher/creategroup':
          result = await client.createGroup();
          break;
        
        case '/api/teacher/fetchGroups':
          result = await client.fetchGroups();
          break;
        
        case '/api/teacher/testresults':
          result = await client.getTestResults(this.getRandomExamId());
          break;
        
        // Test endpoints
        case '/api/tests/starttest':
          result = await client.startTest(this.getRandomExamId());
          break;
        
        case '/api/tests/gettestproblems':
          result = await client.getTestProblems(this.getRandomExamId());
          break;
        
        case '/api/tests/submitcode':
          result = await client.submitTestCode({
            examId: this.getRandomExamId(),
            problemId: this.getRandomProblemId(),
            ...dataGenerator.generateSubmission()
          });
          break;
        
        case '/api/tests/getsubmissions':
          result = await client.getTestSubmissions(this.getRandomExamId());
          break;
        
        case '/api/tests/gettestdetails':
          result = await client.getTestDetails(this.getRandomExamId());
          break;
        
        case '/api/tests/heartbeat':
          result = await client.sendHeartbeat(this.getRandomExamId());
          break;
        
        case '/api/tests/gettestcases':
          result = await client.getTestCases(this.getRandomProblemId());
          break;
        
        case '/api/tests/getproblemdescription':
          result = await client.getProblemDescription(this.getRandomProblemId());
          break;
        
        case '/api/tests/getresult':
          result = await client.getTestResult(this.getRandomExamId());
          break;
        
        case '/api/tests/submittest':
          result = await client.submitTest(this.getRandomExamId());
          break;
        
        // Admin endpoints
        case '/api/admin/uploadproblems':
          result = await client.uploadProblems();
          break;
        
        case '/api/admin/validateProblem':
          result = await client.validateProblem();
          break;
        
        // Onboarding
        case '/api/onboarding':
          result = await client.completeOnboarding({ isOnboarded: true });
          break;
        
        default:
          console.warn(`⚠️  Unknown endpoint: ${endpoint.path}`);
          return;
      }
      
      const endTime = Date.now();
      const success = result && !result.error;
      
      this.metrics.recordRequest(
        endpoint.path,
        endpoint.method,
        startTime,
        endTime,
        success,
        result?.status || (success ? 200 : 500),
        result?.error ? result.message : null,
        userId
      );
      
    } catch (error) {
      const endTime = Date.now();
      this.metrics.recordRequest(
        endpoint.path,
        endpoint.method,
        startTime,
        endTime,
        false,
        500,
        error.message,
        userId
      );
    }
  }

  getRandomProblemId() {
    if (this.testData.problemIds.length > 0) {
      return this.testData.problemIds[Math.floor(Math.random() * this.testData.problemIds.length)];
    }
    return 'test-problem-id'; // Fallback
  }

  getRandomExamId() {
    if (this.testData.examIds.length > 0) {
      return this.testData.examIds[Math.floor(Math.random() * this.testData.examIds.length)];
    }
    return 'test-exam-id'; // Fallback
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    console.log('\\n📊 Generating performance report...');
    
    this.metrics.printReport();
    this.metrics.exportToJson(`stress-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    
    // Check against performance thresholds
    this.checkPerformanceThresholds();
  }

  checkPerformanceThresholds() {
    console.log('\\n🎯 Checking performance thresholds...');
    
    const responseStats = this.metrics.getResponseTimeStats();
    const errorRate = this.metrics.getErrorRate();
    const throughput = this.metrics.getThroughput();
    
    let passed = true;
    
    if (responseStats) {
      if (responseStats.p95 > config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P95) {
        console.log(`❌ P95 response time: ${responseStats.p95.toFixed(0)}ms > ${config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P95}ms`);
        passed = false;
      } else {
        console.log(`✅ P95 response time: ${responseStats.p95.toFixed(0)}ms ≤ ${config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P95}ms`);
      }
      
      if (responseStats.p99 > config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P99) {
        console.log(`❌ P99 response time: ${responseStats.p99.toFixed(0)}ms > ${config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P99}ms`);
        passed = false;
      } else {
        console.log(`✅ P99 response time: ${responseStats.p99.toFixed(0)}ms ≤ ${config.PERFORMANCE_THRESHOLDS.RESPONSE_TIME_P99}ms`);
      }
    }
    
    if (errorRate > config.PERFORMANCE_THRESHOLDS.ERROR_RATE) {
      console.log(`❌ Error rate: ${(errorRate * 100).toFixed(2)}% > ${(config.PERFORMANCE_THRESHOLDS.ERROR_RATE * 100)}%`);
      passed = false;
    } else {
      console.log(`✅ Error rate: ${(errorRate * 100).toFixed(2)}% ≤ ${(config.PERFORMANCE_THRESHOLDS.ERROR_RATE * 100)}%`);
    }
    
    if (throughput < config.PERFORMANCE_THRESHOLDS.THROUGHPUT_MIN) {
      console.log(`❌ Throughput: ${throughput.toFixed(1)} RPS < ${config.PERFORMANCE_THRESHOLDS.THROUGHPUT_MIN} RPS`);
      passed = false;
    } else {
      console.log(`✅ Throughput: ${throughput.toFixed(1)} RPS ≥ ${config.PERFORMANCE_THRESHOLDS.THROUGHPUT_MIN} RPS`);
    }
    
    console.log(`\\n🎯 Performance thresholds: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  }

  async cleanup() {
    console.log('\\n🧹 Cleaning up...');
    
    // Sign out all users
    const signOutPromises = Array.from(this.users.values())
      .filter(userInfo => userInfo.authenticated)
      .map(async (userInfo) => {
        try {
          await userInfo.client.signOut();
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    
    await Promise.allSettled(signOutPromises);
    
    console.log('   ✅ Cleanup complete');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--duration=')) {
      options.duration = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--users=')) {
      options.concurrentUsers = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--url=')) {
      options.baseURL = arg.split('=')[1];
    } else if (arg.startsWith('--delay=')) {
      options.requestDelay = parseInt(arg.split('=')[1]);
    }
  });
  
  console.log('🎯 CodeColiseum API Stress Test');
  console.log('================================');
  console.log(`Base URL: ${options.baseURL || config.BASE_URL}`);
  console.log(`Duration: ${options.duration || config.TEST_DURATION_MINUTES} minutes`);
  console.log(`Concurrent Users: ${options.concurrentUsers || config.CONCURRENT_USERS}`);
  console.log(`Request Delay: ${options.requestDelay || config.REQUEST_DELAY_MS}ms`);
  console.log('\\n');
  
  const stressTest = new StressTest(options);
  
  try {
    await stressTest.setup();
    await stressTest.runStressTest();
    await stressTest.generateReport();
    
    const thresholdsPassed = stressTest.checkPerformanceThresholds();
    process.exit(thresholdsPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Stress test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await stressTest.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n⚠️  Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n⚠️  Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = StressTest;