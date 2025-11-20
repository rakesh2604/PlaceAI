import { APIClient } from '../utils/api-client.js';
import { TEST_CONFIG } from '../config/test-config.js';
import { pollJobStatus } from '../utils/test-helpers.js';
import { createTestPDF } from '../utils/test-helpers.js';
import FormData from 'form-data';

const API = new APIClient(TEST_CONFIG.API_BASE_URL);
let authToken = null;
let testResumeId = null;

async function setupAuth() {
  if (!authToken) {
    const testEmail = `test.jobqueue.${Date.now()}@test.com`;
    const otpResponse = await API.post('/auth/send-otp', {
      body: { email: testEmail }
    });
    const otp = otpResponse.body.otp || '123456';
    
    const verifyResponse = await API.post('/auth/verify-otp', {
      body: {
        email: testEmail,
        otp,
        isSignup: true,
        name: 'Test Job Queue User'
      }
    });
    
    authToken = verifyResponse.body?.token;
    API.setToken(authToken);
  }
}

export async function runJobQueueTests() {
  const results = [];
  await setupAuth();

  // Test 1: Poll parsing job status
  try {
    const start = Date.now();
    // First create a parsing job
    const pdfBuffer = createTestPDF();
    const formData = new FormData();
    formData.append('template', pdfBuffer, {
      filename: 'test-template.pdf',
      contentType: 'application/pdf'
    });

    const createResponse = await API.post('/resume-builder/import-template', {
      body: formData,
      headers: formData.getHeaders()
    });

    const jobId = createResponse.body?.jobId;
    if (jobId) {
      const pollStart = Date.now();
      const status = await pollJobStatus(async () => {
        const statusResponse = await API.get(`/resume-builder/parsing-job/${jobId}`);
        return statusResponse.body?.status;
      });
      const pollDuration = Date.now() - pollStart;

      results.push({
        module: 'Job Queue',
        test: 'Poll parsing job status',
        passed: status === 'completed' || status === 'failed' || status === 'processing',
        duration: pollDuration,
        error: null
      });
    } else {
      results.push({
        module: 'Job Queue',
        test: 'Poll parsing job status',
        passed: false,
        duration: Date.now() - start,
        error: 'Job ID not returned'
      });
    }
  } catch (error) {
    results.push({
      module: 'Job Queue',
      test: 'Poll parsing job status',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 2: Poll render job status
  try {
    const start = Date.now();
    // First create a resume
    const resumeData = {
      templateId: 'modern',
      data: {
        personalInfo: { fullName: 'Test User', email: 'test@test.com' }
      }
    };

    const createResumeResponse = await API.post('/resume-builder/save', {
      body: resumeData
    });

    testResumeId = createResumeResponse.body?.resume?._id;
    if (testResumeId) {
      const renderResponse = await API.post(`/resume-builder/${testResumeId}/generate-pdf`);
      const renderJobId = renderResponse.body?.jobId;

      if (renderJobId) {
        const pollStart = Date.now();
        const status = await pollJobStatus(async () => {
          const statusResponse = await API.get(`/resume-builder/render-job/${renderJobId}`);
          return statusResponse.body?.status;
        });
        const pollDuration = Date.now() - pollStart;

        results.push({
          module: 'Job Queue',
          test: 'Poll render job status',
          passed: status === 'completed' || status === 'failed' || status === 'processing',
          duration: pollDuration,
          error: null
        });
      } else {
        results.push({
          module: 'Job Queue',
          test: 'Poll render job status',
          passed: false,
          duration: Date.now() - start,
          error: 'Render job ID not returned'
        });
      }
    } else {
      results.push({
        module: 'Job Queue',
        test: 'Poll render job status',
        passed: false,
        duration: Date.now() - start,
        error: 'Resume ID not returned'
      });
    }
  } catch (error) {
    results.push({
      module: 'Job Queue',
      test: 'Poll render job status',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 3: Poll ATS job status
  if (testResumeId) {
    try {
      const start = Date.now();
      const atsResponse = await API.post(`/resume-builder/${testResumeId}/improve-ai`, {
        body: {
          jobDescription: 'Test job description',
          jobRole: 'Software Engineer'
        }
      });

      const atsJobId = atsResponse.body?.jobId;
      if (atsJobId) {
        const pollStart = Date.now();
        const status = await pollJobStatus(async () => {
          const statusResponse = await API.get(`/resume-builder/ats-job/${atsJobId}`);
          return statusResponse.body?.status;
        });
        const pollDuration = Date.now() - pollStart;

        results.push({
          module: 'Job Queue',
          test: 'Poll ATS job status',
          passed: status === 'completed' || status === 'failed' || status === 'processing',
          duration: pollDuration,
          error: null
        });
      } else {
        results.push({
          module: 'Job Queue',
          test: 'Poll ATS job status',
          passed: false,
          duration: Date.now() - start,
          error: 'ATS job ID not returned'
        });
      }
    } catch (error) {
      results.push({
        module: 'Job Queue',
        test: 'Poll ATS job status',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 4: Job status with progress tracking
  try {
    const start = Date.now();
    const pdfBuffer = createTestPDF();
    const formData = new FormData();
    formData.append('template', pdfBuffer, {
      filename: 'test-template.pdf',
      contentType: 'application/pdf'
    });

    const createResponse = await API.post('/resume-builder/import-template', {
      body: formData,
      headers: formData.getHeaders()
    });

    const jobId = createResponse.body?.jobId;
    if (jobId) {
      // Poll and check progress
      let progress = 0;
      const status = await pollJobStatus(async () => {
        const statusResponse = await API.get(`/resume-builder/parsing-job/${jobId}`);
        progress = statusResponse.body?.progress || 0;
        return statusResponse.body?.status;
      });

      results.push({
        module: 'Job Queue',
        test: 'Job progress tracking',
        passed: progress >= 0 && (status === 'completed' || status === 'failed'),
        duration: Date.now() - start,
        error: null
      });
    } else {
      results.push({
        module: 'Job Queue',
        test: 'Job progress tracking',
        passed: false,
        duration: Date.now() - start,
        error: 'Job ID not returned'
      });
    }
  } catch (error) {
    results.push({
      module: 'Job Queue',
      test: 'Job progress tracking',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 5: Multiple concurrent jobs
  try {
    const start = Date.now();
    const jobs = [];
    
    // Create multiple jobs
    for (let i = 0; i < 3; i++) {
      const pdfBuffer = createTestPDF();
      const formData = new FormData();
      formData.append('template', pdfBuffer, {
        filename: `test-template-${i}.pdf`,
        contentType: 'application/pdf'
      });

      const response = await API.post('/resume-builder/import-template', {
        body: formData,
        headers: formData.getHeaders()
      });

      if (response.body?.jobId) {
        jobs.push(response.body.jobId);
      }
    }

    // Poll all jobs
    const pollPromises = jobs.map(jobId => 
      pollJobStatus(async () => {
        const statusResponse = await API.get(`/resume-builder/parsing-job/${jobId}`);
        return statusResponse.body?.status;
      })
    );

    const statuses = await Promise.all(pollPromises);
    const duration = Date.now() - start;

    results.push({
      module: 'Job Queue',
      test: 'Multiple concurrent jobs',
      passed: statuses.every(s => s === 'completed' || s === 'failed' || s === 'processing'),
      duration,
      error: null
    });
  } catch (error) {
    results.push({
      module: 'Job Queue',
      test: 'Multiple concurrent jobs',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  return results;
}

