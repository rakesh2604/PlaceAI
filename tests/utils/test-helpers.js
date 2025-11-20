import jwt from 'jsonwebtoken';
import { TEST_CONFIG } from '../config/test-config.js';

/**
 * Generate a JWT token for testing
 */
export function generateToken(userId, email, role, expiresIn = '7d') {
  return jwt.sign(
    { userId, email, role },
    TEST_CONFIG.JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Generate an expired JWT token
 */
export function generateExpiredToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    TEST_CONFIG.JWT_SECRET,
    { expiresIn: '-1h' } // Expired 1 hour ago
  );
}

/**
 * Generate a large payload (10k+ characters)
 */
export function generateLargePayload(size = 10000) {
  return {
    text: 'A'.repeat(size),
    data: {
      content: 'B'.repeat(size),
      description: 'C'.repeat(size)
    }
  };
}

/**
 * Simulate network dropout by rejecting promise
 */
export function simulateNetworkDropout() {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Network request failed: Connection timeout'));
    }, 100);
  });
}

/**
 * Wait for async job to complete
 */
export async function pollJobStatus(getStatusFn, maxAttempts = 30, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getStatusFn();
    if (status === 'completed' || status === 'failed') {
      return status;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Job polling timeout');
}

/**
 * Create test PDF buffer
 */
export function createTestPDF() {
  // Simple PDF header + minimal content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Resume Content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
  return Buffer.from(pdfContent);
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');

/**
 * Create test LinkedIn ZIP buffer
 */
export function createTestLinkedInZIP() {
  // This is a minimal ZIP structure - in real tests, use adm-zip
  const zip = new AdmZip();
  
  // Add basic files that LinkedIn export would have
  zip.addFile('Profile.csv', Buffer.from('Name,Email,Phone\nTest User,test@test.com,+1234567890'));
  zip.addFile('Positions.csv', Buffer.from('Title,Company,Start Date,End Date\nSoftware Engineer,Test Corp,2020-01,2023-12'));
  zip.addFile('Skills.csv', Buffer.from('Skill\nJavaScript\nReact\nNode.js'));
  
  return zip.toBuffer();
}

import crypto from 'crypto';

/**
 * Generate Stripe webhook signature
 */
export function generateStripeWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return {
    signature: `t=${timestamp},v1=${signature}`,
    timestamp
  };
}

/**
 * Format test results as table
 */
export function formatTestResults(results) {
  const rows = results.map(r => ({
    Module: r.module,
    Test: r.test,
    Status: r.passed ? '✅ PASS' : '❌ FAIL',
    Duration: `${r.duration}ms`,
    Error: r.error || '-'
  }));
  
  return rows;
}

/**
 * Print results table
 */
export function printResultsTable(results) {
  console.log('\n' + '='.repeat(100));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(100));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log('\n' + '-'.repeat(100));
  console.log('Module'.padEnd(25) + 'Test'.padEnd(40) + 'Status'.padEnd(15) + 'Duration'.padEnd(12) + 'Error');
  console.log('-'.repeat(100));
  
  results.forEach(r => {
    const status = r.passed ? '✅ PASS'.padEnd(15) : '❌ FAIL'.padEnd(15);
    const error = r.error ? r.error.substring(0, 30) : '-';
    console.log(
      r.module.padEnd(25) +
      r.test.padEnd(40) +
      status +
      `${r.duration}ms`.padEnd(12) +
      error
    );
  });
  
  console.log('-'.repeat(100));
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(2)}%`);
}

