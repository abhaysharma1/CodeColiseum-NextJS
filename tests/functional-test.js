#!/usr/bin/env node

const config = require('./config');
const ApiClient = require('./api-client');
const dataGenerator = require('./data-generator');

class FunctionalTest {
  constructor(baseURL = config.BASE_URL) {
    this.baseURL = baseURL;
    this.client = new ApiClient(baseURL);
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      console.log(`   ✅ ${testName} passed (${duration}ms)`);
      this.testResults.push({ name: testName, status: 'PASS', duration, error: null });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ ${testName} failed: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAIL', duration, error: error.message });
    }
  }

  async testAuthentication() {
    // Test user signup
    const userData = dataGenerator.generateUser('STUDENT');
    userData.email = `functional.test.${Date.now()}@test.com`;
    
    const signUpResult = await this.client.signUp(userData);
    if (signUpResult.error) {
      throw new Error(`Sign up failed: ${signUpResult.message}`);
    }
    
    // Test user signin
    const signInResult = await this.client.signIn({
      email: userData.email,
      password: userData.password
    });
    
    if (signInResult.error) {
      throw new Error(`Sign in failed: ${signInResult.message}`);
    }
    
    // Test session retrieval
    const sessionResult = await this.client.getSession();
    if (sessionResult.error) {
      throw new Error(`Get session failed: ${sessionResult.message}`);
    }
    
    if (!sessionResult.user || sessionResult.user.email !== userData.email) {
      throw new Error('Session data mismatch');
    }
  }

  async testProblemsApi() {
    // Test get problems
    const problemsResult = await this.client.getProblems({
      take: 5,
      skip: 0
    });
    
    if (problemsResult.error) {
      throw new Error(`Get problems failed: ${problemsResult.message}`);
    }
    
    if (!Array.isArray(problemsResult)) {
      throw new Error('Expected problems array');
    }
    
    // Test problem search
    const searchResult = await this.client.getProblems({
      searchValue: 'test',
      difficulty: 'EASY',
      take: 10
    });
    
    if (searchResult.error) {
      throw new Error(`Problem search failed: ${searchResult.message}`);
    }
  }

  async testTeacherWorkflow() {
    // Create a teacher user
    const teacherData = dataGenerator.generateUser('TEACHER');
    teacherData.email = `teacher.functional.${Date.now()}@test.com`;
    
    // Sign up and sign in as teacher
    await this.client.signUp(teacherData);
    await this.client.signIn({
      email: teacherData.email,
      password: teacherData.password
    });
    
    // Test create group
    const groupData = dataGenerator.generateGroup();
    const groupResult = await this.client.createGroup(groupData);
    
    if (groupResult.error) {
      throw new Error(`Create group failed: ${groupResult.message}`);
    }
    
    // Test fetch groups
    const groupsResult = await this.client.fetchGroups();
    
    if (groupsResult.error) {
      throw new Error(`Fetch groups failed: ${groupsResult.message}`);
    }
  }

  async testCodeSubmission() {
    // Test code run (doesn't require actual problems to exist for basic API test)
    const runResult = await this.client.runCode({
      problemId: 'test-problem-id',
      language: 'javascript',
      sourceCode: dataGenerator.generateCode('javascript')
    });
    
    // This might fail due to missing problem, but we're testing the API response format
    if (runResult.error && !runResult.message.includes('Problem') && !runResult.message.includes('404')) {
      throw new Error(`Unexpected run code error: ${runResult.message}`);
    }
  }

  async testEndpointsAccessibility() {
    const endpoints = [
      { method: 'POST', path: '/api/problems/getproblems', requiresAuth: true },
      { method: 'GET', path: '/api/auth/session', requiresAuth: true },
      { method: 'GET', path: '/api/teacher/fetchGroups', requiresAuth: true },
      { method: 'GET', path: '/api/tests/gettestdetails', requiresAuth: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        let result;
        if (endpoint.method === 'GET') {
          result = await this.client.client.get(endpoint.path);
        } else {
          result = await this.client.client.post(endpoint.path, {});
        }
        
        // If we get here without throwing, the endpoint is accessible
        console.log(`   📡 ${endpoint.method} ${endpoint.path}: ${result.status}`);
      } catch (error) {
        // Check if it's an auth error (401/403) vs server error (5xx)
        const status = error.response?.status || 0;
        if (endpoint.requiresAuth && (status === 401 || status === 403)) {
          console.log(`   📡 ${endpoint.method} ${endpoint.path}: ${status} (auth required - expected)`);
        } else if (status >= 200 && status < 500) {
          console.log(`   📡 ${endpoint.method} ${endpoint.path}: ${status}`);
        } else {
          throw new Error(`Endpoint ${endpoint.path} unreachable: ${status}`);
        }
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting functional tests...');
    console.log(`Testing API at: ${this.baseURL}`);
    console.log('');
    
    // Test basic endpoint accessibility
    await this.runTest('Endpoint Accessibility', () => this.testEndpointsAccessibility());
    
    // Test authentication flow
    await this.runTest('User Authentication', () => this.testAuthentication());
    
    // Test problems API
    await this.runTest('Problems API', () => this.testProblemsApi());
    
    // Test teacher workflow
    await this.runTest('Teacher Workflow', () => this.testTeacherWorkflow());
    
    // Test code submission
    await this.runTest('Code Submission API', () => this.testCodeSubmission());
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\\n' + '='.repeat(60));
    console.log('               FUNCTIONAL TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`\\n📊 Summary: ${passed}/${total} tests passed`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\\n✅ Passed tests:');
    this.testResults
      .filter(r => r.status === 'PASS')
      .forEach(test => {
        console.log(`   - ${test.name} (${test.duration}ms)`);
      });
    
    console.log('\\n' + '='.repeat(60));
    
    return failed === 0;
  }
}

// CLI interface
async function main() {
  const baseURL = process.argv[2] || config.BASE_URL;
  
  console.log('🧪 CodeColiseum API Functional Tests');
  console.log('====================================');
  
  const functionalTest = new FunctionalTest(baseURL);
  
  try {
    const allPassed = await functionalTest.runAllTests();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FunctionalTest;