import { runAuthTests } from './suites/auth.test.js';
import { runResumeBuilderTests } from './suites/resume-builder.test.js';
import { runInterviewTests } from './suites/interview.test.js';
import { runJudgePanelTests } from './suites/judge-panel.test.js';
import { runRecruiterCRMTests } from './suites/recruiter-crm.test.js';
import { runAdminPanelTests } from './suites/admin-panel.test.js';
import { runPaymentTests } from './suites/payment.test.js';
import { runRoutingUITests } from './suites/routing-ui.test.js';
import { runJobQueueTests } from './suites/job-queue.test.js';
import { runEdgeCaseTests } from './suites/edge-cases.test.js';
import { printResultsTable } from './utils/test-helpers.js';

async function runAllTests() {
  console.log('🚀 Starting PlacedAI End-to-End Test Suite...\n');
  console.log('='.repeat(100));
  console.log('TEST EXECUTION');
  console.log('='.repeat(100) + '\n');

  const allResults = [];
  const startTime = Date.now();

  // Run all test suites
  const testSuites = [
    { name: 'Authentication', fn: runAuthTests },
    { name: 'Resume Builder', fn: runResumeBuilderTests },
    { name: 'AI Interview Engine', fn: runInterviewTests },
    { name: 'Judge Panel', fn: runJudgePanelTests },
    { name: 'Recruiter CRM', fn: runRecruiterCRMTests },
    { name: 'Admin Panel', fn: runAdminPanelTests },
    { name: 'Payment System', fn: runPaymentTests },
    { name: 'Routing/UI', fn: runRoutingUITests },
    { name: 'Job Queue', fn: runJobQueueTests },
    { name: 'Edge Cases', fn: runEdgeCaseTests }
  ];

  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name} tests...`);
    try {
      const results = await suite.fn();
      allResults.push(...results);
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      console.log(`   ✅ ${passed} passed, ❌ ${failed} failed`);
    } catch (error) {
      console.error(`   ❌ Error running ${suite.name} tests:`, error.message);
      allResults.push({
        module: suite.name,
        test: 'Test suite execution',
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  const totalDuration = Date.now() - startTime;

  // Print results table
  printResultsTable(allResults);

  // Generate summary report
  generateSummaryReport(allResults, totalDuration);

  // Exit with appropriate code
  const failedCount = allResults.filter(r => !r.passed).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

function generateSummaryReport(results, totalDuration) {
  console.log('\n' + '='.repeat(100));
  console.log('TEST COVERAGE SUMMARY REPORT');
  console.log('='.repeat(100));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  // Group by module
  const byModule = {};
  results.forEach(r => {
    if (!byModule[r.module]) {
      byModule[r.module] = { passed: 0, failed: 0, total: 0 };
    }
    byModule[r.module].total++;
    if (r.passed) {
      byModule[r.module].passed++;
    } else {
      byModule[r.module].failed++;
    }
  });

  console.log('\n📊 Module Coverage:');
  console.log('-'.repeat(100));
  Object.entries(byModule).forEach(([module, stats]) => {
    const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`${module.padEnd(30)} ${stats.passed}/${stats.total} passed (${percentage}%)`);
  });

  console.log('\n📈 Overall Statistics:');
  console.log('-'.repeat(100));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(2)}%)`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

  console.log('\n✅ Covered Features:');
  console.log('-'.repeat(100));
  console.log('✓ Authentication (signup, login, OTP, role isolation)');
  console.log('✓ Resume Builder (CRUD, file upload, LinkedIn ZIP import, ATS scoring, PDF export)');
  console.log('✓ AI Interview Engine (WebSocket, TTS, transcript, evaluation)');
  console.log('✓ Judge Panel (individual + combined evaluations)');
  console.log('✓ Recruiter CRM (login, create job, get applicants)');
  console.log('✓ Admin Panel (user mgmt, roles)');
  console.log('✓ Payment System (Stripe checkout + webhook signature verification)');
  console.log('✓ Routing/UI checks');
  console.log('✓ Job Queue (polling)');
  console.log('✓ Edge Cases (token expiry, network dropout, large payload)');

  console.log('\n⚠️  Manual Tests Required:');
  console.log('-'.repeat(100));
  console.log('• Visual UI/UX testing (colors, spacing, animations)');
  console.log('• Cross-browser compatibility (Chrome, Firefox, Safari, Edge)');
  console.log('• Mobile responsiveness (iOS, Android)');
  console.log('• Accessibility testing (screen readers, keyboard navigation)');
  console.log('• Performance testing (load times, memory usage)');
  console.log('• Security penetration testing');
  console.log('• Email delivery verification (OTP emails)');
  console.log('• WhatsApp integration testing');
  console.log('• Real Stripe payment flow (test mode)');
  console.log('• File upload with actual large files (>10MB)');
  console.log('• WebSocket reconnection handling');
  console.log('• Multi-language support (i18n)');
  console.log('• Real-time collaboration features');
  console.log('• Data export/import functionality');
  console.log('• Backup and recovery procedures');
  console.log('• Load testing (concurrent users)');
  console.log('• Stress testing (system limits)');

  console.log('\n' + '='.repeat(100));
  console.log('Report generated at:', new Date().toISOString());
  console.log('='.repeat(100) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

