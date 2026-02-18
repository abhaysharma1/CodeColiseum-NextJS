const axios = require('axios');
const config = require('./config');
const dataGenerator = require('./data-generator');

class ApiClient {
  constructor(baseURL = config.BASE_URL) {
    this.baseURL = baseURL;
    this.sessionToken = null;
    this.cookies = '';
    this.userRole = null;
    this.userId = null;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeColiseum-StressTest/1.0'
      }
    });

    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        if (this.cookies) {
          config.headers['Cookie'] = this.cookies;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle cookies
    this.client.interceptors.response.use(
      (response) => {
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
          this.cookies = setCookie.join('; ');
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async signUp(userData) {
    try {
      const response = await this.client.post('/api/auth/sign-up', userData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signIn(credentials) {
    try {
      const response = await this.client.post('/api/auth/sign-in', credentials);
      if (response.data && response.headers['set-cookie']) {
        this.cookies = response.headers['set-cookie'].join('; ');
        this.userRole = credentials.role || 'STUDENT';
      }
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSession() {
    try {
      const response = await this.client.get('/api/auth/session');
      if (response.data && response.data.user) {
        this.userId = response.data.user.id;
        this.userRole = response.data.user.role;
      }
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signOut() {
    try {
      const response = await this.client.post('/api/auth/sign-out');
      this.sessionToken = null;
      this.cookies = '';
      this.userRole = null;
      this.userId = null;
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Problem methods
  async getProblems(searchParams = {}) {
    const defaultParams = {
      searchValue: '',
      tagName: null,
      difficulty: null,
      take: 10,
      skip: 0,
      ...searchParams
    };
    
    try {
      const response = await this.client.post('/api/problems/getproblems', defaultParams);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitCode(submissionData) {
    const defaultData = {
      problemId: 'test-problem-id',
      language: 'javascript',
      sourceCode: dataGenerator.generateCode(),
      ...submissionData
    };
    
    try {
      const response = await this.client.post('/api/problems/submitcode', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async runCode(codeData) {
    const defaultData = {
      problemId: 'test-problem-id',
      language: 'javascript',
      sourceCode: dataGenerator.generateCode(),
      ...codeData
    };
    
    try {
      const response = await this.client.post('/api/problems/runcode', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubmissions(problemId = 'test-problem-id') {
    try {
      const response = await this.client.post('/api/problems/getsubmissions', { problemId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTemplateCode(language = 'javascript', problemId = 'test-problem-id') {
    try {
      const response = await this.client.get(`/api/problems/getTemplateCode?language=${language}&problemId=${problemId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Teacher methods
  async createGroup(groupData) {
    const defaultData = {
      ...dataGenerator.generateGroup(),
      ...groupData
    };
    
    try {
      const response = await this.client.post('/api/teacher/creategroup', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async fetchGroups() {
    try {
      const response = await this.client.get('/api/teacher/fetchGroups');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestResults(testId = 'test-exam-id') {
    try {
      const response = await this.client.get(`/api/teacher/testresults?examId=${testId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Test/Exam methods
  async startTest(examId = 'test-exam-id') {
    try {
      const response = await this.client.post('/api/tests/starttest', { examId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestProblems(examId = 'test-exam-id') {
    try {
      const response = await this.client.get(`/api/tests/gettestproblems?examId=${examId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitTestCode(submissionData) {
    const defaultData = {
      examId: 'test-exam-id',
      problemId: 'test-problem-id',
      language: 'javascript',
      sourceCode: dataGenerator.generateCode(),
      ...submissionData
    };
    
    try {
      const response = await this.client.post('/api/tests/submitcode', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestSubmissions(examId = 'test-exam-id') {
    try {
      const response = await this.client.get(`/api/tests/getsubmissions?examId=${examId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestDetails(examId = 'test-exam-id') {
    try {
      const response = await this.client.get(`/api/tests/gettestdetails?examId=${examId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async sendHeartbeat(examId = 'test-exam-id') {
    const heartbeatData = {
      examId,
      ...dataGenerator.generateHeartbeatData()
    };
    
    try {
      const response = await this.client.post('/api/tests/heartbeat', heartbeatData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestCases(problemId = 'test-problem-id') {
    try {
      const response = await this.client.get(`/api/tests/gettestcases?problemId=${problemId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProblemDescription(problemId = 'test-problem-id') {
    try {
      const response = await this.client.get(`/api/tests/getproblemdescription?problemId=${problemId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestResult(examId = 'test-exam-id', studentId = null) {
    const params = new URLSearchParams({ examId });
    if (studentId) params.append('studentId', studentId);
    
    try {
      const response = await this.client.get(`/api/tests/getresult?${params.toString()}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitTest(examId = 'test-exam-id') {
    try {
      const response = await this.client.post('/api/tests/submittest', { examId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Admin methods
  async uploadProblems(problemsData) {
    const defaultData = {
      problems: [dataGenerator.generateProblem()],
      ...problemsData
    };
    
    try {
      const response = await this.client.post('/api/admin/uploadproblems', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async validateProblem(problemData) {
    const defaultData = {
      ...dataGenerator.generateProblem(),
      ...problemData
    };
    
    try {
      const response = await this.client.post('/api/admin/validateProblem', defaultData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Onboarding methods
  async completeOnboarding(onboardingData = {}) {
    try {
      const response = await this.client.post('/api/onboarding', onboardingData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Utility methods
  handleError(error) {
    const errorInfo = {
      success: false,
      error: true,
      message: error.message || 'Unknown error',
      status: error.response?.status || 0,
      statusText: error.response?.statusText || '',
      data: error.response?.data || null,
      url: error.config?.url || '',
      method: error.config?.method?.toUpperCase() || '',
      timestamp: new Date().toISOString()
    };

    // Don't throw, return error info for metrics
    return errorInfo;
  }

  isAuthenticated() {
    return !!this.cookies && !!this.userRole;
  }

  getUserRole() {
    return this.userRole;
  }

  getUserId() {
    return this.userId;
  }
}

module.exports = ApiClient;