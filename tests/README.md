# CodeColiseum API Test Suite

A comprehensive test suite for stress testing and functional validation of all CodeColiseum API endpoints.

## 📋 Overview

This test suite provides:
- **Stress Testing**: 2-minute load testing with configurable concurrent users
- **Functional Testing**: Basic API functionality validation
- **Performance Metrics**: Detailed response time, throughput, and error rate analysis
- **Authentication Testing**: Complete login/logout flow testing
- **Synthetic Data Generation**: Realistic test data for all endpoints
- **Multi-Role Testing**: Tests for Admin, Teacher, and Student roles

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tests
npm install
```

### 2. Run Functional Tests (Quick Validation)

```bash
npm run test
# or
node functional-test.js
```

### 3. Run Full Stress Test (2 minutes)

```bash
npm run stress-test
# or
node stress-test.js
```

### 4. Run Quick Stress Test (30 seconds)

```bash
npm run quick-test
# or
node stress-test.js --duration=0.5
```

## ⚙️ Configuration

### Environment Variables

Set these environment variables to customize test behavior:

```bash
# Base URL for the API
export BASE_URL=http://localhost:3000

# Test duration in minutes
export TEST_DURATION=2

# Number of concurrent users
export CONCURRENT_USERS=10

# Delay between requests (milliseconds)
export REQUEST_DELAY=100
```

### Command Line Options

```bash
# Custom duration (minutes)
node stress-test.js --duration=5

# Custom concurrent users
node stress-test.js --users=20

# Custom API URL
node stress-test.js --url=https://your-api.com

# Custom request delay (milliseconds)
node stress-test.js --delay=200

# Combined options
node stress-test.js --duration=1 --users=5 --url=http://localhost:3000
```

## 📊 Test Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `GET /api/auth/session` - Session validation

### Problems
- `POST /api/problems/getproblems` - Problem search and pagination
- `POST /api/problems/submitcode` - Code submission
- `POST /api/problems/runcode` - Code execution
- `POST /api/problems/getsubmissions` - Submission history
- `GET /api/problems/getTemplateCode` - Template code retrieval

### Teacher Features
- `POST /api/teacher/creategroup` - Group creation
- `GET /api/teacher/fetchGroups` - Group management
- `GET /api/teacher/testresults` - Exam results

### Tests/Exams
- `POST /api/tests/starttest` - Start exam attempt
- `GET /api/tests/gettestproblems` - Exam problems
- `POST /api/tests/submitcode` - Exam code submission
- `GET /api/tests/getsubmissions` - Exam submissions
- `GET /api/tests/gettestdetails` - Exam details
- `POST /api/tests/heartbeat` - Connection monitoring
- `GET /api/tests/gettestcases` - Test cases
- `GET /api/tests/getproblemdescription` - Problem description
- `GET /api/tests/getresult` - Exam results
- `POST /api/tests/submittest` - Submit exam

### Admin Features
- `POST /api/admin/uploadproblems` - Problem upload
- `POST /api/admin/validateProblem` - Problem validation

### Onboarding
- `POST /api/onboarding` - User onboarding

## 📈 Performance Metrics

The test suite tracks and reports:

### Response Time Metrics
- **Average**: Mean response time across all requests
- **Median**: 50th percentile response time
- **P75, P90, P95, P99**: Response time percentiles
- **Min/Max**: Fastest and slowest responses

### Throughput Metrics
- **Requests per second (RPS)**: Overall throughput
- **Per-endpoint throughput**: RPS for each API endpoint
- **Per-user throughput**: RPS per concurrent user

### Error Rate Metrics
- **Overall error rate**: Percentage of failed requests
- **Per-endpoint error rate**: Failure rate by endpoint
- **Error categorization**: Errors grouped by status code

### Performance Thresholds
- **P95 < 2 seconds**: 95% of requests complete within 2 seconds
- **P99 < 5 seconds**: 99% of requests complete within 5 seconds
- **Error rate < 5%**: Less than 5% of requests fail
- **Throughput > 10 RPS**: Minimum 10 requests per second

## 📁 Generated Reports

### Console Output
Real-time progress and summary statistics displayed in the terminal.

### JSON Export
Detailed results exported to timestamped JSON files:
```
stress-test-results-2026-02-09T10-30-45-123Z.json
```

### Report Contents
- Test configuration and parameters
- Request-level details (timing, success/failure, errors)
- Aggregated statistics by endpoint and user
- Performance threshold compliance
- Error analysis and categorization

## 🔧 Test Data Generation

### Synthetic Users
- **Roles**: Admin, Teacher, Student with appropriate permissions
- **Realistic data**: Names, emails, passwords using faker libraries
- **Authentication**: Automatic signup and login for all test users

### Test Problems
- **Algorithmic problems**: Array, sorting, tree, graph problems
- **Multiple difficulties**: Easy, Medium, Hard
- **Code templates**: JavaScript, Python, C++, Java
- **Test cases**: Input/output pairs with validation

### Realistic Workloads
- **Search queries**: Common algorithm keywords
- **Code submissions**: Valid solutions in multiple languages
- **User behavior**: Realistic request patterns and timing

## 🛠️ Architecture

### Components

1. **StressTest** (`stress-test.js`)
   - Main orchestrator
   - User simulation management
   - Test execution coordination

2. **ApiClient** (`api-client.js`)
   - HTTP client wrapper
   - Authentication handling
   - Request/response processing

3. **PerformanceMetrics** (`performance-metrics.js`)
   - Metrics collection and aggregation
   - Statistical analysis
   - Report generation

4. **DataGenerator** (`data-generator.js`)
   - Synthetic data creation
   - Realistic test scenarios
   - Randomized test cases

5. **Configuration** (`config.js`)
   - Test parameters
   - Endpoint definitions
   - Performance thresholds

### Concurrency Model
- **Multi-user simulation**: Each user runs independently
- **Async/await**: Non-blocking request processing
- **Rate limiting**: Configurable delays between requests
- **Graceful degradation**: Continues testing despite individual failures

## 🔍 Debugging

### Verbose Output
Uncomment debug lines in the code for detailed request/response logging.

### Individual Endpoint Testing
Test specific endpoints by modifying the `executeEndpoint` function.

### Custom Test Scenarios
Add new test scenarios by extending the `DataGenerator` or creating custom endpoint functions.

## ⚠️ Important Notes

### Development vs Production
- **Development**: Tests create and clean up test data
- **Production**: Use with caution; avoid creating real user data

### Database Impact
- Tests create temporary users, groups, and problems
- Cleanup is attempted but may not be 100% reliable
- Monitor database size during extended testing

### Rate Limiting
- Start with lower concurrent users (5-10)
- Increase gradually to find system limits
- Monitor server resources during testing

### Security
- Test users have predictable passwords
- Clean up test accounts after testing
- Use separate test environment when possible

## 🐛 Troubleshooting

### Common Issues

1. **Connection refused**
   ```
   Error: connect ECONNREFUSED
   ```
   - Ensure your API server is running
   - Check the BASE_URL configuration
   - Verify network connectivity

2. **Authentication failures**
   ```
   Authentication failed: Invalid credentials
   ```
   - Check if user registration is working
   - Verify email verification requirements
   - Ensure consistent user data generation

3. **High error rates**
   ```
   Error rate: 15% > 5%
   ```
   - Reduce concurrent users
   - Increase request delays
   - Check server resource utilization

4. **Timeout errors**
   ```
   Request timeout after 30000ms
   ```
   - Increase timeout values in api-client.js
   - Check server performance
   - Reduce request complexity

### Performance Tips

1. **Start small**: Begin with 5 concurrent users for 30 seconds
2. **Scale gradually**: Increase users/duration incrementally
3. **Monitor resources**: Watch CPU, memory, database connections
4. **Isolate issues**: Test individual endpoints if overall test fails

## 📝 Example Output

```
🎯 CodeColiseum API Stress Test
================================
Base URL: http://localhost:3000
Duration: 2 minutes
Concurrent Users: 10
Request Delay: 100ms

🔧 Setting up stress test environment...
👥 Creating test users...
   Created 10 test users
🔐 Authenticating users...
   ✅ 10 users authenticated successfully
📊 Setting up test data...
   ✅ Test problems created
   ✅ Created 3 test groups
   📊 Test data setup complete

🚀 Starting stress test...
🏁 Ending stress test at 2026-02-09T10:32:45.123Z

================================================================================
                          STRESS TEST RESULTS
================================================================================

📊 OVERVIEW:
   Test Duration: 120.45 seconds
   Total Requests: 2,847
   Successful: 2,698 (94.77%)
   Failed: 149 (5.23%)
   Throughput: 23.64 requests/second

⏱️  RESPONSE TIMES:
   Average: 342.15ms
   Median:  298.50ms
   Min:     45.20ms
   Max:     1,847.30ms
   75th:    456.80ms
   90th:    691.20ms
   95th:    1,023.40ms
   99th:    1,456.70ms

🔗 TOP ENDPOINTS BY THROUGHPUT:
   1. POST /api/problems/getproblems
      Requests: 445, Success: 97.1%, Avg: 234ms, RPS: 3.7
   2. GET /api/auth/session
      Requests: 398, Success: 99.2%, Avg: 123ms, RPS: 3.3
   3. POST /api/tests/heartbeat
      Requests: 321, Success: 95.6%, Avg: 87ms, RPS: 2.7

🎯 Performance thresholds: ✅ PASSED

📄 Detailed report exported to stress-test-results-2026-02-09T10-32-45-123Z.json
```

---

For questions or issues, please check the [main project documentation](../README.md) or create an issue in the repository.