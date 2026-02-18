module.exports = {
  // Base configuration
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  TEST_DURATION_MINUTES: process.env.TEST_DURATION || 2,
  CONCURRENT_USERS: process.env.CONCURRENT_USERS || 10,
  REQUEST_DELAY_MS: process.env.REQUEST_DELAY || 100,
  
  // Test users configuration
  TEST_USERS: {
    ADMIN: {
      email: 'admin.test@codecoliseum.com',
      password: 'StressTest2024!',
      name: 'Admin Test User',
      role: 'ADMIN'
    },
    TEACHER: {
      email: 'teacher.test@codecoliseum.com',
      password: 'StressTest2024!',
      name: 'Teacher Test User',
      role: 'TEACHER'
    },
    STUDENT: {
      email: 'student.test@codecoliseum.com',
      password: 'StressTest2024!',
      name: 'Student Test User',
      role: 'STUDENT'
    }
  },

  // API Endpoints to test
  ENDPOINTS: {
    AUTH: [
      { method: 'POST', path: '/api/auth/sign-up', auth: false },
      { method: 'POST', path: '/api/auth/sign-in', auth: false },
      { method: 'GET', path: '/api/auth/session', auth: true }
    ],
    PROBLEMS: [
      { method: 'POST', path: '/api/problems/getproblems', auth: true },
      { method: 'POST', path: '/api/problems/submitcode', auth: true },
      { method: 'POST', path: '/api/problems/runcode', auth: true },
      { method: 'POST', path: '/api/problems/getsubmissions', auth: true },
      { method: 'GET', path: '/api/problems/getTemplateCode', auth: true }
    ],
    TEACHER: [
      { method: 'POST', path: '/api/teacher/creategroup', auth: true, roles: ['TEACHER'] },
      { method: 'GET', path: '/api/teacher/fetchGroups', auth: true, roles: ['TEACHER'] },
      { method: 'GET', path: '/api/teacher/testresults', auth: true, roles: ['TEACHER'] }
    ],
    TESTS: [
      { method: 'POST', path: '/api/tests/starttest', auth: true, roles: ['STUDENT'] },
      { method: 'GET', path: '/api/tests/gettestproblems', auth: true },
      { method: 'POST', path: '/api/tests/submitcode', auth: true },
      { method: 'GET', path: '/api/tests/getsubmissions', auth: true },
      { method: 'GET', path: '/api/tests/gettestdetails', auth: true },
      { method: 'POST', path: '/api/tests/heartbeat', auth: true },
      { method: 'GET', path: '/api/tests/gettestcases', auth: true },
      { method: 'GET', path: '/api/tests/getproblemdescription', auth: true },
      { method: 'GET', path: '/api/tests/getresult', auth: true },
      { method: 'POST', path: '/api/tests/submittest', auth: true }
    ],
    ONBOARDING: [
      { method: 'POST', path: '/api/onboarding', auth: true }
    ]
  },

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    RESPONSE_TIME_P95: 2000, // 95th percentile should be under 2 seconds
    RESPONSE_TIME_P99: 5000, // 99th percentile should be under 5 seconds
    ERROR_RATE: 0.05, // Error rate should be under 5%
    THROUGHPUT_MIN: 10 // Minimum requests per second
  }
};