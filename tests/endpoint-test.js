#!/usr/bin/env node

const config = require('./config');
const ApiClient = require('./api-client');
const dataGenerator = require('./data-generator');

class EndpointTester {
  constructor(baseURL = config.BASE_URL) {
    this.baseURL = baseURL;
    this.client = new ApiClient(baseURL);
  }

  async authenticateAs(role = 'STUDENT') {
    const userData = dataGenerator.generateUser(role);
    userData.email = `endpoint.test.${role.toLowerCase()}.${Date.now()}@test.com`;
    
    console.log(`🔐 Authenticating as ${role}...`);
    
    try {
      // Try to sign up
      await this.client.signUp(userData);
      console.log('   ✅ Sign up successful');
    } catch (error) {
      console.log(`   ⚠️  Sign up failed (may already exist): ${error.message}`);
    }
    
    // Sign in
    const signInResult = await this.client.signIn({
      email: userData.email,
      password: userData.password
    });
    
    if (signInResult.error) {
      throw new Error(`Authentication failed: ${signInResult.message}`);
    }
    
    console.log(`   ✅ Authenticated as ${role}: ${userData.email}`);
    return userData;
  }

  async testEndpoint(method, path, data = null, options = {}) {
    console.log(`\\n🧪 Testing: ${method.toUpperCase()} ${path}`);
    console.log(`   Data: ${data ? JSON.stringify(data, null, 2) : 'None'}`);
    
    const startTime = Date.now();
    
    try {
      let result;
      
      if (method.toLowerCase() === 'get') {
        const url = data ? `${path}?${new URLSearchParams(data).toString()}` : path;
        result = await this.client.client.get(url);
      } else {
        result = await this.client.client[method.toLowerCase()](path, data);
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Status: ${result.status} ${result.statusText}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📊 Response size: ${JSON.stringify(result.data).length} characters`);
      
      if (options.showResponse) {
        console.log(`   📄 Response:`, JSON.stringify(result.data, null, 2));
      }
      
      return { success: true, status: result.status, data: result.data, duration };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   📊 Status: ${error.response?.status || 'No response'}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      
      if (error.response?.data && options.showResponse) {
        console.log(`   📄 Error response:`, JSON.stringify(error.response.data, null, 2));
      }
      
      return { 
        success: false, 
        status: error.response?.status || 0, 
        error: error.message,
        data: error.response?.data,
        duration 
      };
    }
  }

  async testMultipleEndpoints(endpoints, options = {}) {
    console.log(`🧪 Testing ${endpoints.length} endpoints...`);
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(
        endpoint.method,
        endpoint.path,
        endpoint.data,
        options
      );
      
      results.push({
        endpoint: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        ...result
      });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Print summary
    console.log('\\n📊 Test Summary:');
    console.log('================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total: ${results.length}, Successful: ${successful}, Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed endpoints:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   ${result.endpoint}: ${result.status} - ${result.error}`);
      });
    }
    
    console.log('\\n✅ Successful endpoints:');
    results.filter(r => r.success).forEach(result => {
      console.log(`   ${result.endpoint}: ${result.status} (${result.duration}ms)`);
    });
    
    return results;
  }
}

// Predefined test scenarios
const TEST_SCENARIOS = {
  auth: [
    { method: 'get', path: '/api/auth/session', data: null },
  ],
  problems: [
    { method: 'post', path: '/api/problems/getproblems', data: { take: 5, skip: 0 } },
    { method: 'post', path: '/api/problems/getproblems', data: { searchValue: 'array', take: 3 } },
    { method: 'get', path: '/api/problems/getTemplateCode', data: { language: 'javascript', problemId: 'test' } },
  ],
  teacher: [
    { method: 'get', path: '/api/teacher/fetchGroups', data: null },
    { method: 'post', path: '/api/teacher/creategroup', data: dataGenerator.generateGroup() },
  ],
  tests: [
    { method: 'get', path: '/api/tests/gettestdetails', data: { examId: 'test-exam' } },
    { method: 'post', path: '/api/tests/heartbeat', data: { examId: 'test-exam', timestamp: new Date().toISOString() } },
  ],
  admin: [
    { method: 'post', path: '/api/admin/validateProblem', data: dataGenerator.generateProblem() },
  ]
};

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔧 CodeColiseum Endpoint Tester');
    console.log('===============================');
    console.log('');
    console.log('Usage:');
    console.log('  node endpoint-test.js <scenario>                 # Test predefined scenario');
    console.log('  node endpoint-test.js <method> <path> [data]     # Test single endpoint');
    console.log('  node endpoint-test.js --list                     # List available scenarios');
    console.log('');
    console.log('Examples:');
    console.log('  node endpoint-test.js auth                       # Test auth endpoints');
    console.log('  node endpoint-test.js problems                   # Test problem endpoints');
    console.log('  node endpoint-test.js get /api/auth/session      # Test single endpoint');
    console.log('  node endpoint-test.js post /api/problems/getproblems \'{"take":5}\'');
    console.log('');
    console.log('Options:');
    console.log('  --show-response                                  # Show full response data');
    console.log('  --role=ADMIN|TEACHER|STUDENT                     # Authenticate as specific role');
    console.log('  --url=http://localhost:3000                      # Use custom base URL');
    return;
  }
  
  if (args[0] === '--list') {
    console.log('📋 Available test scenarios:');
    Object.keys(TEST_SCENARIOS).forEach(scenario => {
      console.log(`   ${scenario}: ${TEST_SCENARIOS[scenario].length} endpoints`);
    });
    return;
  }
  
  // Parse options
  const options = {
    showResponse: args.includes('--show-response'),
    role: (args.find(arg => arg.startsWith('--role='))?.split('=')[1]) || 'STUDENT',
    baseURL: (args.find(arg => arg.startsWith('--url='))?.split('=')[1]) || config.BASE_URL
  };
  
  // Remove options from args
  const cleanArgs = args.filter(arg => !arg.startsWith('--'));
  
  const tester = new EndpointTester(options.baseURL);
  
  try {
    // Authenticate first
    await tester.authenticateAs(options.role);
    
    if (cleanArgs.length === 1 && TEST_SCENARIOS[cleanArgs[0]]) {
      // Test predefined scenario
      const scenario = cleanArgs[0];
      console.log(`\\n🎯 Running ${scenario} scenario...`);
      await tester.testMultipleEndpoints(TEST_SCENARIOS[scenario], options);
    } else if (cleanArgs.length >= 2) {
      // Test single endpoint
      const method = cleanArgs[0];
      const path = cleanArgs[1];
      const data = cleanArgs[2] ? JSON.parse(cleanArgs[2]) : null;
      
      await tester.testEndpoint(method, path, data, options);
    } else {
      console.error('❌ Invalid arguments. Use --help for usage information.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EndpointTester, TEST_SCENARIOS };