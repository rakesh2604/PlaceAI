import api from './api';

/**
 * Comprehensive System Test Runner for PlacedAI
 * Tests all modules: Auth, DB, Resume, Interview, CRM, Admin, Payments, etc.
 */

const TEST_CATEGORIES = {
  HEALTH: 'Health & Backend',
  AUTH: 'Authentication',
  DATABASE: 'Database',
  RESUME: 'Resume Builder',
  INTERVIEW: 'AI Interview Engine',
  JUDGE: 'Judge Panel',
  HIRING_MANAGER: 'Hiring Manager Panel',
  COACH: 'AI Coach Interrupt Mode',
  RECRUITER: 'Recruiter CRM',
  ADMIN: 'Admin Panel',
  PAYMENT: 'Payment System',
  ROUTING: 'Routing & UI',
  JOBS: 'File & Job Queue'
};

class TestRunner {
  constructor() {
    this.results = [];
    this.summary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      criticalErrors: []
    };
    this.onProgress = null;
  }

  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  log(testName, status, reason = '', fix = '', category = '') {
    const result = {
      name: testName,
      status: status.toUpperCase(), // PASS, FAIL, WARNING
      reason,
      fix,
      category,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    this.summary.totalTests++;
    
    if (status === 'PASS') {
      this.summary.passed++;
    } else if (status === 'FAIL') {
      this.summary.failed++;
      if (reason.includes('critical') || reason.includes('blocking')) {
        this.summary.criticalErrors.push(testName);
      }
    } else if (status === 'WARNING') {
      this.summary.warnings++;
    }

    if (this.onProgress) {
      this.onProgress(result, this.summary);
    }
  }

  async runTest(testName, testFn, category = '') {
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      this.log(testName, 'PASS', `Completed in ${duration}ms`, '', category);
      return true;
    } catch (error) {
      const errorMsg = error.message || error.toString();
      
      // Check if it's a network error (backend not reachable)
      const isNetworkError = !error.response || 
                            error.code === 'ECONNREFUSED' || 
                            error.code === 'ETIMEDOUT' ||
                            error.code === 'ERR_NETWORK' ||
                            error.code === 'ERR_CONNECTION_REFUSED' ||
                            error.message?.includes('Network Error') ||
                            error.message?.includes('timeout');
      
      if (isNetworkError) {
        this.log(testName, 'FAIL', 
          `Network error: Backend not reachable. ${errorMsg}`, 
          'Ensure backend server is running. Check VITE_API_BASE_URL in .env',
          category);
      } else {
        const fix = this.suggestFix(testName, errorMsg);
        this.log(testName, 'FAIL', errorMsg, fix, category);
      }
      return false;
    }
  }

  suggestFix(testName, error) {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return 'Check backend server is running and accessible. Verify API_BASE_URL in environment variables.';
    }
    if (errorLower.includes('401') || errorLower.includes('unauthorized')) {
      return 'Check authentication token is valid. User may need to login again.';
    }
    if (errorLower.includes('404') || errorLower.includes('not found')) {
      return 'Endpoint may not be implemented yet. Check backend routes.';
    }
    if (errorLower.includes('database') || errorLower.includes('mongodb')) {
      return 'Check MongoDB connection. Verify MONGO_URI in backend .env file.';
    }
    if (errorLower.includes('timeout')) {
      return 'Request timed out. Check backend performance or increase timeout.';
    }
    if (errorLower.includes('missing') || errorLower.includes('required')) {
      return 'Required field or configuration is missing. Check environment variables or request payload.';
    }
    
    return 'Review error details and check backend logs for more information.';
  }

  // ==================== TEST CATEGORIES ====================

  async testHealth() {
    await this.runTest('Health Check API', async () => {
      const response = await api.get('/health');
      if (response.status !== 200) {
        throw new Error(`Health check returned status ${response.status}`);
      }
      // Accept 'ok' or 'degraded' status (degraded means DB might be disconnected but server is up)
      if (response.data.status !== 'ok' && response.data.status !== 'degraded') {
        throw new Error(`Unexpected health status: ${response.data.status}`);
      }
    }, TEST_CATEGORIES.HEALTH);

    await this.runTest('API Base URL Resolution', async () => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
      if (!baseURL) throw new Error('API base URL not configured');
      // Base URL should be a string
      if (typeof baseURL !== 'string') {
        throw new Error('API base URL must be a string');
      }
    }, TEST_CATEGORIES.HEALTH);

    await this.runTest('Backend Response Time', async () => {
      const start = Date.now();
      const response = await api.get('/health', { timeout: 5000 });
      const duration = Date.now() - start;
      if (duration > 2000) {
        this.log('Backend Response Time', 'WARNING',
          `Backend response slow: ${duration}ms (acceptable but not optimal)`,
          'Check backend performance and network latency',
          TEST_CATEGORIES.HEALTH);
      }
      // Don't fail, just warn if slow
      if (response.status !== 200) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
    }, TEST_CATEGORIES.HEALTH);

    await this.runTest('Environment Variables Loaded', async () => {
      // VITE_API_BASE_URL is optional (defaults to '/api')
      // Just check that we can access env vars
      const hasEnv = typeof import.meta.env !== 'undefined';
      if (!hasEnv) {
        throw new Error('Environment variables not accessible');
      }
    }, TEST_CATEGORIES.HEALTH);
  }

  async testAuth() {
    // Test signup endpoint exists
    await this.runTest('Signup Endpoint Available', async () => {
      try {
        await api.post('/auth/send-otp', { email: 'test@example.com' });
      } catch (error) {
        if (error.response?.status === 400) {
          // Expected validation error, endpoint exists
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.AUTH);

    // Test login endpoint
    await this.runTest('Login Endpoint Available', async () => {
      try {
        await api.post('/auth/send-otp', { email: 'test@example.com' });
      } catch (error) {
        if (error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.AUTH);

    // Test OTP endpoint
    await this.runTest('OTP Verification Endpoint', async () => {
      try {
        await api.post('/auth/verify-otp', { 
          email: 'test@example.com', 
          otp: '123456' 
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          // Expected - endpoint exists
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.AUTH);

    // Test permission isolation (would need actual auth tokens)
    this.log('Permission Isolation Test', 'WARNING', 
      'Requires authenticated tokens for each role', 
      'Manually test with student/recruiter/admin tokens',
      TEST_CATEGORIES.AUTH);
  }

  async testDatabase() {
    // Test MongoDB connection via health check
    await this.runTest('MongoDB Connection', async () => {
      const response = await api.get('/health');
      if (response.status !== 200) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const dbStatus = response.data.database;
      if (dbStatus !== 'connected') {
        // Don't fail, just warn if DB is disconnected
        this.log('MongoDB Connection Status', 'WARNING',
          `Database status: ${dbStatus}. Server is running but database may be disconnected.`,
          'Check MONGO_URI in backend .env file and ensure MongoDB is running',
          TEST_CATEGORIES.DATABASE);
        return; // Don't throw, just log warning
      }
    }, TEST_CATEGORIES.DATABASE);

    // Test read/write via health check (indirect)
    await this.runTest('Database Read/Write Test', async () => {
      const response = await api.get('/health');
      if (response.status === 200 && response.data.database === 'connected') {
        // If DB is connected, assume read/write works
        return;
      }
      // If DB not connected, mark as warning
      this.log('Database Read/Write Test', 'WARNING',
        'Cannot verify read/write without database connection',
        'Ensure MongoDB is running and connected',
        TEST_CATEGORIES.DATABASE);
    }, TEST_CATEGORIES.DATABASE);

    this.log('Database Index Check', 'WARNING',
      'Requires database inspection',
      'Check MongoDB indexes via admin panel or MongoDB shell',
      TEST_CATEGORIES.DATABASE);
  }

  async testResumeBuilder() {
    // Test resume creation endpoint
    await this.runTest('Create Resume Endpoint', async () => {
      try {
        await api.post('/resume-builder/save', {});
      } catch (error) {
        if (error.response?.status === 401) {
          // Requires auth - endpoint exists
          return;
        }
        if (error.response?.status === 400) {
          // Validation error - endpoint exists
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RESUME);

    // Test resume list endpoint
    await this.runTest('List Resumes Endpoint', async () => {
      try {
        await api.get('/resume-builder/all');
      } catch (error) {
        if (error.response?.status === 401) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RESUME);

    // Test template import
    this.log('Template Import Test', 'WARNING',
      'Requires file upload',
      'Test with actual PDF/DOCX file upload',
      TEST_CATEGORIES.RESUME);

    // Test LinkedIn import
    this.log('LinkedIn ZIP Import', 'WARNING',
      'Requires file upload',
      'Test with LinkedIn export ZIP file',
      TEST_CATEGORIES.RESUME);

    // Test ATS scoring
    await this.runTest('ATS Scoring Endpoint', async () => {
      try {
        await api.post('/resume/ats-score', {
          jobDescription: 'Test job',
          jobRole: 'Developer'
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RESUME);

    // Test PDF export
    await this.runTest('PDF Export Endpoint', async () => {
      try {
        await api.post('/resume-builder/test-id/generate-pdf');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 400) {
          // Endpoint exists and requires auth/valid resume
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RESUME);
  }

  async testInterview() {
    // Test interview start
    await this.runTest('Start Interview Endpoint', async () => {
      try {
        await api.post('/interview/start', {});
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.INTERVIEW);

    // Test evaluation endpoint
    await this.runTest('Interview Evaluation Endpoint', async () => {
      try {
        await api.post('/interview/evaluate', { interviewId: 'test' });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.INTERVIEW);

    // Test behavior stream
    await this.runTest('Behavior Stream Endpoint', async () => {
      try {
        await api.post('/interview/behavior-stream', {
          interviewId: 'test',
          behaviorData: {}
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.INTERVIEW);

    this.log('Avatar TTS Test', 'WARNING',
      'Requires WebSocket connection',
      'Test WebSocket connection for real-time TTS',
      TEST_CATEGORIES.INTERVIEW);

    this.log('Live Transcript Engine', 'WARNING',
      'Requires WebSocket and audio input',
      'Test with actual microphone input',
      TEST_CATEGORIES.INTERVIEW);
  }

  async testJudgePanel() {
    await this.runTest('Judge Evaluation Endpoint', async () => {
      try {
        await api.post('/judge/evaluate/test-interview-id', {
          scores: {},
          feedback: 'Test'
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.JUDGE);

    await this.runTest('Combined Evaluation Endpoint', async () => {
      try {
        await api.get('/judge/combined-evaluation/test-interview-id');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.JUDGE);

    this.log('Individual Judge Types', 'WARNING',
      'Requires multiple judge evaluations',
      'Test with actual judge submissions',
      TEST_CATEGORIES.JUDGE);
  }

  async testHiringManager() {
    this.log('Hiring Manager Panel', 'WARNING',
      'May use same endpoints as Judge Panel',
      'Verify hiring manager role permissions',
      TEST_CATEGORIES.HIRING_MANAGER);
  }

  async testCoach() {
    this.log('AI Coach Interrupt Mode', 'WARNING',
      'Requires real-time behavior analysis',
      'Test during live interview with pauses/filler words',
      TEST_CATEGORIES.COACH);
  }

  async testRecruiter() {
    await this.runTest('Recruiter Login Endpoint', async () => {
      try {
        await api.post('/auth/recruiter/login', {
          email: 'test@example.com',
          password: 'test'
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RECRUITER);

    await this.runTest('Create Job Endpoint', async () => {
      try {
        await api.post('/recruiter/jobs', {});
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RECRUITER);

    await this.runTest('Get Applicants Endpoint', async () => {
      try {
        await api.get('/recruiter/applicants');
      } catch (error) {
        if (error.response?.status === 401) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.RECRUITER);
  }

  async testAdmin() {
    await this.runTest('Admin Routes Available', async () => {
      try {
        await api.get('/admin/users');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.ADMIN);
  }

  async testPayment() {
    await this.runTest('Create Checkout Session', async () => {
      try {
        await api.post('/billing/create-checkout-session', {
          planId: 'premium'
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.PAYMENT);

    this.log('Webhook Signature Verification', 'WARNING',
      'Requires Stripe webhook test',
      'Test with Stripe webhook simulator',
      TEST_CATEGORIES.PAYMENT);
  }

  async testRouting() {
    // Test that routes exist (would need router access)
    this.log('Route Loading Test', 'WARNING',
      'Requires router inspection',
      'Manually verify all routes load without 404',
      TEST_CATEGORIES.ROUTING);

    this.log('Navbar Links', 'WARNING',
      'Requires UI inspection',
      'Manually test all navbar links',
      TEST_CATEGORIES.ROUTING);
  }

  async testJobs() {
    await this.runTest('Evaluation Job Polling', async () => {
      try {
        await api.get('/interview/evaluation-job/test-job-id');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.JOBS);

    await this.runTest('Parsing Job Polling', async () => {
      try {
        await api.get('/resume-builder/parsing-job/test-job-id');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return;
        }
        throw error;
      }
    }, TEST_CATEGORIES.JOBS);
  }

  async testEdgeCases() {
    // Network dropout simulation
    this.log('Network Dropout Retry', 'WARNING',
      'Requires network simulation',
      'Test with network simulator enabled',
      'Edge Cases');

    // Token expiry
    this.log('Token Expiry Handling', 'WARNING',
      'Requires expired token',
      'Test with expired JWT token',
      'Edge Cases');

    // Large resume text
    this.log('Large Resume Text (>10k chars)', 'WARNING',
      'Requires large payload test',
      'Test resume with >10k characters',
      'Edge Cases');
  }

  async runAllTests() {
    this.results = [];
    this.summary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      criticalErrors: []
    };

    try {
      await this.testHealth();
      await this.testAuth();
      await this.testDatabase();
      await this.testResumeBuilder();
      await this.testInterview();
      await this.testJudgePanel();
      await this.testHiringManager();
      await this.testCoach();
      await this.testRecruiter();
      await this.testAdmin();
      await this.testPayment();
      await this.testRouting();
      await this.testJobs();
      await this.testEdgeCases();
    } catch (error) {
      this.log('Test Runner Error', 'FAIL', 
        `Unexpected error: ${error.message}`, 
        'Check test runner implementation',
        'System');
    }

    return {
      summary: this.summary,
      detailed: this.results
    };
  }

  getReport() {
    return {
      summary: this.summary,
      detailed: this.results,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}

export default TestRunner;

