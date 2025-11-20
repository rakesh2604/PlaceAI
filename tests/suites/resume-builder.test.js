import { APIClient } from '../utils/api-client.js';
import { TEST_CONFIG } from '../config/test-config.js';
import { createTestPDF, createTestLinkedInZIP, generateLargePayload } from '../utils/test-helpers.js';
import FormData from 'form-data';
import fs from 'fs';

const API = new APIClient(TEST_CONFIG.API_BASE_URL);
let authToken = null;
let testResumeId = null;

// Setup: Authenticate before tests
async function setupAuth() {
  if (!authToken) {
    const testEmail = `test.resume.${Date.now()}@test.com`;
    const otpResponse = await API.post('/auth/send-otp', {
      body: { email: testEmail }
    });
    const otp = otpResponse.body.otp || '123456';
    
    const verifyResponse = await API.post('/auth/verify-otp', {
      body: {
        email: testEmail,
        otp,
        isSignup: true,
        name: 'Test Resume User'
      }
    });
    
    authToken = verifyResponse.body?.token;
    API.setToken(authToken);
  }
}

export async function runResumeBuilderTests() {
  const results = [];
  await setupAuth();

  // Test 1: Create resume
  try {
    const start = Date.now();
    const resumeData = {
      templateId: 'modern',
      data: {
        personalInfo: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        experience: [
          {
            title: 'Software Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: '2023-12',
            description: 'Developed web applications'
          }
        ],
        education: [
          {
            degree: 'BS Computer Science',
            institution: 'University',
            startDate: '2016',
            endDate: '2020'
          }
        ],
        skills: [
          { category: 'Programming', items: ['JavaScript', 'React', 'Node.js'] }
        ]
      }
    };

    const response = await API.post('/resume-builder/save', {
      body: resumeData
    });
    const duration = Date.now() - start;

    testResumeId = response.body?.resume?._id;
    results.push({
      module: 'Resume Builder',
      test: 'Create resume',
      passed: response.status === 200 && !!testResumeId,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Create resume',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 2: Get all resumes
  try {
    const start = Date.now();
    const response = await API.get('/resume-builder/all');
    const duration = Date.now() - start;

    results.push({
      module: 'Resume Builder',
      test: 'Get all resumes',
      passed: response.status === 200 && Array.isArray(response.body?.resumes),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Get all resumes',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 3: Get single resume
  if (testResumeId) {
    try {
      const start = Date.now();
      const response = await API.get(`/resume-builder/${testResumeId}`);
      const duration = Date.now() - start;

      results.push({
        module: 'Resume Builder',
        test: 'Get single resume',
        passed: response.status === 200 && response.body?.resume,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'Resume Builder',
        test: 'Get single resume',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 4: Update resume
  if (testResumeId) {
    try {
      const start = Date.now();
      const updateData = {
        resumeId: testResumeId,
        templateId: 'modern',
        data: {
          personalInfo: {
            fullName: 'John Doe Updated',
            email: 'john@example.com'
          }
        }
      };

      const response = await API.post('/resume-builder/save', {
        body: updateData
      });
      const duration = Date.now() - start;

      results.push({
        module: 'Resume Builder',
        test: 'Update resume',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'Resume Builder',
        test: 'Update resume',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 5: Upload PDF resume
  try {
    const start = Date.now();
    const pdfBuffer = createTestPDF();
    
    // Use form-data for file upload
    const formData = new FormData();
    formData.append('resume', pdfBuffer, {
      filename: 'test-resume.pdf',
      contentType: 'application/pdf'
    });

    const response = await API.post('/resume/upload', {
      body: formData,
      headers: formData.getHeaders()
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Resume Builder',
      test: 'Upload PDF resume',
      passed: response.status === 200 || response.status === 201,
      duration,
      error: response.status >= 400 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Upload PDF resume',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 6: Import LinkedIn ZIP
  try {
    const start = Date.now();
    const zipBuffer = createTestLinkedInZIP();
    
    const formData = new FormData();
    formData.append('zip', zipBuffer, {
      filename: 'linkedin-export.zip',
      contentType: 'application/zip'
    });

    const response = await API.post('/resume-builder/import-linkedin-zip', {
      body: formData,
      headers: formData.getHeaders()
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Resume Builder',
      test: 'Import LinkedIn ZIP',
      passed: response.status === 200 && !!response.body?.jobId,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Import LinkedIn ZIP',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 7: Import template (PDF/DOCX)
  try {
    const start = Date.now();
    const pdfBuffer = createTestPDF();
    
    const formData = new FormData();
    formData.append('template', pdfBuffer, {
      filename: 'template-resume.pdf',
      contentType: 'application/pdf'
    });

    const response = await API.post('/resume-builder/import-template', {
      body: formData,
      headers: formData.getHeaders()
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Resume Builder',
      test: 'Import template (PDF)',
      passed: response.status === 200 && !!response.body?.jobId,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Import template (PDF)',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 8: ATS scoring
  if (testResumeId) {
    try {
      const start = Date.now();
      const response = await API.post(`/resume-builder/${testResumeId}/improve-ai`, {
        body: {
          jobDescription: 'Looking for a software engineer with React and Node.js experience',
          jobRole: 'Software Engineer'
        }
      });
      const duration = Date.now() - start;

      results.push({
        module: 'Resume Builder',
        test: 'ATS scoring job creation',
        passed: response.status === 200 && !!response.body?.jobId,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'Resume Builder',
        test: 'ATS scoring job creation',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 9: Generate PDF export
  if (testResumeId) {
    try {
      const start = Date.now();
      const response = await API.post(`/resume-builder/${testResumeId}/generate-pdf`);
      const duration = Date.now() - start;

      results.push({
        module: 'Resume Builder',
        test: 'Generate PDF export',
        passed: response.status === 200 && !!response.body?.jobId,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'Resume Builder',
        test: 'Generate PDF export',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 10: Delete resume
  if (testResumeId) {
    try {
      const start = Date.now();
      const response = await API.delete(`/resume-builder/${testResumeId}`);
      const duration = Date.now() - start;

      results.push({
        module: 'Resume Builder',
        test: 'Delete resume',
        passed: response.status === 200,
        duration,
        error: response.status !== 200 ? `Status ${response.status}` : null
      });
    } catch (error) {
      results.push({
        module: 'Resume Builder',
        test: 'Delete resume',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Test 11: Large payload (10k+ characters)
  try {
    const start = Date.now();
    const largePayload = generateLargePayload(15000);
    const resumeData = {
      templateId: 'modern',
      data: {
        personalInfo: {
          fullName: largePayload.text.substring(0, 100),
          summary: largePayload.text
        }
      }
    };

    const response = await API.post('/resume-builder/save', {
      body: resumeData
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Resume Builder',
      test: 'Large payload (10k+ chars)',
      passed: response.status === 200 || response.status === 400, // 400 is OK if payload too large
      duration,
      error: response.status >= 500 ? `Server error: ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Resume Builder',
      test: 'Large payload (10k+ chars)',
      passed: !error.message.includes('ECONNREFUSED'),
      duration: 0,
      error: error.message.includes('ECONNREFUSED') ? null : error.message
    });
  }

  return results;
}

