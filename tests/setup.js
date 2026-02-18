#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up CodeColiseum API Test Environment');
console.log('================================================');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Run this script from the tests directory.');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if main project is running
console.log('\\n🌐 Checking API availability...');
const config = require('./config');
const ApiClient = require('./api-client');

async function checkApiHealth() {
  try {
    const client = new ApiClient(config.BASE_URL);
    const response = await client.client.get('/api/auth/session');
    console.log(`✅ API is accessible at ${config.BASE_URL}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`⚠️  API is not running at ${config.BASE_URL}`);
      console.log('   Please start your development server first:');
      console.log('   npm run dev  (or)  yarn dev');
      return false;
    } else {
      console.log(`✅ API is accessible at ${config.BASE_URL} (${error.response?.status || 'connection ok'})`);
      return true;
    }
  }
}

// Create test results directory
console.log('\\n📁 Creating test results directory...');
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
  console.log('✅ Results directory created');
} else {
  console.log('✅ Results directory already exists');
}

// Run health check
checkApiHealth().then(apiHealthy => {
  console.log('\\n🎯 Setup Summary:');
  console.log('================');
  console.log(`Dependencies: ✅ Installed`);
  console.log(`API Health: ${apiHealthy ? '✅ Available' : '⚠️  Not accessible'}`);
  console.log(`Results Dir: ✅ Ready`);
  
  console.log('\\n🚀 Ready to run tests!');
  console.log('');
  console.log('Quick start commands:');
  console.log('  npm test                    # Run functional tests');
  console.log('  npm run stress-test         # Run 2-minute stress test');
  console.log('  npm run quick-test          # Run 30-second stress test');
  console.log('');
  console.log('Custom options:');
  console.log('  node stress-test.js --duration=1 --users=5');
  console.log('  node functional-test.js http://localhost:3000');
  
  if (!apiHealthy) {
    console.log('\\n⚠️  Remember to start your API server before running tests!');
  }
});