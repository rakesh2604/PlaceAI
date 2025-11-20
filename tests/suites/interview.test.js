import { APIClient } from '../utils/api-client.js';
import { TEST_CONFIG } from '../config/test-config.js';
import { pollJobStatus } from '../utils/test-helpers.js';
import { io as Client } from 'socket.io-client';

const API = new APIClient(TEST_CONFIG.API_BASE_URL);
let authToken = null;
let testJobId = null;
let testInterviewId = null;

async function setupAuth() {
  if (!authToken) {
    const testEmail = `test.interview.${Date.now()}@test.com`;
    const otpResponse = await API.post('/auth/send-otp', {
      body: { email: testEmail }
    });
    const otp = otpResponse.body.otp || '123456';
    
    const verifyResponse = await API.post('/auth/verify-otp', {
      body: {
        email: testEmail,
        otp,
        isSignup: true,
        name: 'Test Interview User'
      }
    });
    
    authToken = verifyResponse.body?.token;
    API.setToken(authToken);
  }
}

async function createTestJob() {
  if (!testJobId) {
    // Create a test job (requires recruiter or admin token)
    // For now, we'll use a mock job ID or create via admin
    testJobId = '507f1f77bcf86cd799439011'; // Mock ObjectId
  }
  return testJobId;
}

export async function runInterviewTests() {
  const results = [];
  await setupAuth();
  await createTestJob();

  // Test 1: Start interview
  try {
    const start = Date.now();
    const response = await API.post('/interview/start', {
      body: {
        jobId: testJobId,
        detectedLanguage: 'en'
      }
    });
    const duration = Date.now() - start;

    testInterviewId = response.body?.sessionId || response.body?.interview?._id;
    results.push({
      module: 'AI Interview Engine',
      test: 'Start interview',
      passed: response.status === 200 && !!testInterviewId,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'AI Interview Engine',
      test: 'Start interview',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 2: Begin interview session
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/begin', {
        body: { interviewId: testInterviewId }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'AI Interview Engine',
        test: 'Begin interview session',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Begin interview session',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 3: Save answer
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/save-answer', {
        body: {
          interviewId: testInterviewId,
          questionId: 'q1',
          transcript: 'This is my answer to the first question.',
          timeTaken: 45,
          language: 'en'
        }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'AI Interview Engine',
        test: 'Save answer',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Save answer',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 4: Transcript chunk upload
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/transcript-chunk', {
        body: {
          interviewId: testInterviewId,
          questionId: 'q1',
          offset: 0,
          text: 'First chunk of transcript'
        }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'AI Interview Engine',
        test: 'Transcript chunk upload',
        passed: response.status === 200 && response.body?.acknowledged,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Transcript chunk upload',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 5: WebSocket connection
  try {
    const start = Date.now();
    const socket = Client(TEST_CONFIG.API_BASE_URL.replace('/api', ''), {
      auth: { token: authToken },
      transports: ['websocket']
    });

    const connected = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    const duration = Date.now() - start;
    results.push({
      module: 'AI Interview Engine',
      test: 'WebSocket connection',
      passed: connected,
      duration,
      error: null
    });
  } catch (error) {
    results.push({
      module: 'AI Interview Engine',
      test: 'WebSocket connection',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 6: Behavior stream
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/behavior-stream', {
        body: {
          interviewId: testInterviewId,
          questionId: 'q1',
          metrics: {
            fillerWords: 5,
            pauseCount: 3,
            speakingRate: 150,
            confidence: 0.8,
            energy: 0.7
          }
        }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'AI Interview Engine',
        test: 'Behavior stream',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Behavior stream',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 7: Next question
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/next-question', {
        body: { interviewId: testInterviewId }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'AI Interview Engine',
        test: 'Move to next question',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Move to next question',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 8: Evaluate interview (async job)
  if (testInterviewId) {
    try {
      const start = Date.now();
      const response = await API.post('/interview/evaluate', {
        body: { interviewId: testInterviewId }
      });
      const duration = Date.now() - start;

      const jobId = response.body?.jobId;
      results.push({
        module: 'AI Interview Engine',
        test: 'Start evaluation job',
        passed: response.status === 200 && !!jobId,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });

      // Test 9: Poll evaluation job status
      if (jobId) {
        try {
          const pollStart = Date.now();
          const status = await pollJobStatus(async () => {
            const statusResponse = await API.get(`/interview/evaluation-job/${jobId}`);
            return statusResponse.body?.status;
          });
          const pollDuration = Date.now() - pollStart;

          results.push({
            module: 'AI Interview Engine',
            test: 'Poll evaluation job status',
            passed: status === 'completed' || status === 'failed',
            duration: pollDuration,
            error: status !== 'completed' && status !== 'failed' ? `Unexpected status: ${status}` : null
          });
        } catch (error) {
          results.push({
            module: 'AI Interview Engine',
            test: 'Poll evaluation job status',
            passed: false,
            duration: 0,
            error: error.message
          });
        }
      }
    } catch (error) {
      results.push({
        module: 'AI Interview Engine',
        test: 'Start evaluation job',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 10: Get user interviews
  try {
    const start = Date.now();
    const response = await API.get('/interview/my');
    const duration = Date.now() - start;

    results.push({
      module: 'AI Interview Engine',
      test: 'Get user interviews',
      passed: response.status === 200 && Array.isArray(response.body?.interviews),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'AI Interview Engine',
      test: 'Get user interviews',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  return results;
}

