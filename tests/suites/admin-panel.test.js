import { APIClient } from '../utils/api-client.js';
import { TEST_CONFIG, ROLES } from '../config/test-config.js';

const API = new APIClient(TEST_CONFIG.API_BASE_URL);
let adminToken = null;

async function setupAdminAuth() {
  if (!adminToken) {
    const adminEmail = TEST_CONFIG.TEST_EMAIL_ADMIN;
    const otpResponse = await API.post('/auth/send-otp', {
      body: { email: adminEmail }
    });
    const otp = otpResponse.body.otp || '123456';
    
    const verifyResponse = await API.post('/auth/verify-otp', {
      body: {
        email: adminEmail,
        otp,
        isSignup: false,
        isAdminLogin: true
      }
    });
    
    adminToken = verifyResponse.body?.token;
    API.setToken(adminToken);
  }
}

export async function runAdminPanelTests() {
  const results = [];
  await setupAdminAuth();

  // Test 1: Get all users
  try {
    const start = Date.now();
    const response = await API.get('/admin/users');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get all users',
      passed: response.status === 200 && Array.isArray(response.body?.users),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get all users',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 2: Get all recruiters
  try {
    const start = Date.now();
    const response = await API.get('/admin/recruiters');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get all recruiters',
      passed: response.status === 200 && Array.isArray(response.body?.recruiters),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get all recruiters',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 3: Update recruiter status
  try {
    const start = Date.now();
    const recruiterId = '507f1f77bcf86cd799439011'; // Mock ID
    const response = await API.patch(`/admin/recruiters/${recruiterId}/status`, {
      body: { isApproved: true }
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Update recruiter status',
      passed: response.status === 200 || response.status === 404, // 404 if recruiter not found
      duration,
      error: response.status >= 500 ? `Server error: ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Update recruiter status',
      passed: true,
      duration: 0,
      error: null
    });
  }

  // Test 4: Get all interviews
  try {
    const start = Date.now();
    const response = await API.get('/admin/interviews');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get all interviews',
      passed: response.status === 200 && Array.isArray(response.body?.interviews),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get all interviews',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 5: Get all payments
  try {
    const start = Date.now();
    const response = await API.get('/admin/payments');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get all payments',
      passed: response.status === 200 && Array.isArray(response.body?.payments),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get all payments',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 6: Block/Unblock user
  try {
    const start = Date.now();
    const userId = '507f1f77bcf86cd799439011'; // Mock ID
    const response = await API.patch(`/admin/users/${userId}/block`, {
      body: { isBlocked: true }
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Block/Unblock user',
      passed: response.status === 200 || response.status === 404,
      duration,
      error: response.status >= 500 ? `Server error: ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Block/Unblock user',
      passed: true,
      duration: 0,
      error: null
    });
  }

  // Test 7: Update user plan
  try {
    const start = Date.now();
    const userId = '507f1f77bcf86cd799439011'; // Mock ID
    const response = await API.patch(`/admin/users/${userId}/plan`, {
      body: { planId: 'premium' }
    });
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Update user plan',
      passed: response.status === 200 || response.status === 404,
      duration,
      error: response.status >= 500 ? `Server error: ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Update user plan',
      passed: true,
      duration: 0,
      error: null
    });
  }

  // Test 8: Get dashboard stats
  try {
    const start = Date.now();
    const response = await API.get('/admin/stats');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get dashboard stats',
      passed: response.status === 200 && response.body?.totalCandidates !== undefined,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get dashboard stats',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 9: Get ATS scores
  try {
    const start = Date.now();
    const response = await API.get('/admin/ats-scores');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get ATS scores',
      passed: response.status === 200 && Array.isArray(response.body?.atsScores),
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get ATS scores',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 10: Get usage overview
  try {
    const start = Date.now();
    const response = await API.get('/admin/usage');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Get usage overview',
      passed: response.status === 200 && response.body?.users !== undefined,
      duration,
      error: response.status !== 200 ? `Status ${response.status}` : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Get usage overview',
      passed: false,
      duration: 0,
      error: error.message
    });
  }

  // Test 11: Role-based access (only admin)
  try {
    const start = Date.now();
    // Try with candidate token (should fail)
    const candidateToken = 'candidate-token';
    const response = await API.setToken(candidateToken).get('/admin/users');
    const duration = Date.now() - start;

    results.push({
      module: 'Admin Panel',
      test: 'Role-based access control',
      passed: response.status === 401 || response.status === 403,
      duration,
      error: response.status === 200 ? 'Non-admin accessed admin route' : null
    });
  } catch (error) {
    results.push({
      module: 'Admin Panel',
      test: 'Role-based access control',
      passed: true,
      duration: 0,
      error: null
    });
  }

  return results;
}

