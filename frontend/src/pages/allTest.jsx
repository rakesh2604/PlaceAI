import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Download, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  FileText,
  Server,
  Database,
  User,
  Briefcase,
  MessageSquare,
  CreditCard,
  Settings
} from 'lucide-react';
import TestRunner from '../services/testRunner';
import Button from '../components/ui/Button';

const STATUS_COLORS = {
  PASS: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  FAIL: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  WARNING: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
};

const STATUS_ICONS = {
  PASS: CheckCircle2,
  FAIL: XCircle,
  WARNING: AlertTriangle
};

const CATEGORY_ICONS = {
  'Health & Backend': Server,
  'Authentication': User,
  'Database': Database,
  'Resume Builder': FileText,
  'AI Interview Engine': MessageSquare,
  'Judge Panel': User,
  'Hiring Manager Panel': User,
  'AI Coach Interrupt Mode': Settings,
  'Recruiter CRM': Briefcase,
  'Admin Panel': Settings,
  'Payment System': CreditCard,
  'Routing & UI': Settings,
  'File & Job Queue': Server
};

export default function AllTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    criticalErrors: []
  });
  const [report, setReport] = useState(null);
  const logEndRef = useRef(null);
  const testRunnerRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary({
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      criticalErrors: []
    });

    const runner = new TestRunner();
    testRunnerRef.current = runner;

    runner.setProgressCallback((result, summary) => {
      setResults(prev => [...prev, result]);
      setSummary({ ...summary });
    });

    try {
      const report = await runner.runAllTests();
      setReport(runner.getReport());
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placedai-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeletePage = () => {
    if (!window.confirm('Are you sure you want to remove the allTest page? You will need to manually delete the files.')) {
      return;
    }

    const instructions = `
To remove the allTest page:

1. Delete the file: frontend/src/pages/allTest.jsx
2. Delete the file: frontend/src/services/testRunner.js
3. Remove the route from: frontend/src/routes/CandidateRoutes.jsx
   - Remove the import: import AllTest from '../pages/allTest';
   - Remove the route: <Route path="/allTest" ... />

After deletion, refresh your application.
    `.trim();

    alert(instructions);
    
    // Try to copy instructions to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(instructions).then(() => {
        console.log('Instructions copied to clipboard');
      });
    }
  };

  const getStatusCount = (status) => {
    return results.filter(r => r.status === status).length;
  };

  const groupedResults = results.reduce((acc, result) => {
    const category = result.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2">
            All Systems <span className="gradient-text">Diagnostic Test</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            Comprehensive test suite for the entire PlacedAI ecosystem
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-100">
                {summary.totalTests}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {summary.passed}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {summary.failed}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {summary.warnings}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {summary.criticalErrors.length}
              </div>
              <div className="text-sm text-dark-600 dark:text-dark-400">Critical</div>
            </div>
          </div>

          {/* Critical Errors Display */}
          {summary.criticalErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Critical Errors:
              </div>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                {summary.criticalErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          <Button
            onClick={handleRunTests}
            disabled={isRunning}
            loading={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isRunning ? 'Running Tests...' : 'Run Full System Test'}
          </Button>

          <Button
            onClick={handleDownloadReport}
            disabled={!report || isRunning}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download JSON Report
          </Button>

          <Button
            onClick={handleDeletePage}
            disabled={isRunning}
            variant="danger"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Remove allTest Page
          </Button>
        </motion.div>

        {/* Results Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-4">
            Test Results
          </h2>

          {results.length === 0 && !isRunning && (
            <div className="text-center py-12 text-dark-600 dark:text-dark-400">
              Click "Run Full System Test" to begin testing
            </div>
          )}

          {isRunning && results.length === 0 && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500 mb-4" />
              <p className="text-dark-600 dark:text-dark-400">Starting tests...</p>
            </div>
          )}

          {/* Grouped Results by Category */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {Object.entries(groupedResults).map(([category, categoryResults]) => {
              const Icon = CATEGORY_ICONS[category] || FileText;
              return (
                <div key={category} className="border-b border-dark-200 dark:border-dark-700 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100">
                      {category}
                    </h3>
                    <span className="text-sm text-dark-500 dark:text-dark-500">
                      ({categoryResults.length} tests)
                    </span>
                  </div>
                  <div className="space-y-2 ml-7">
                    {categoryResults.map((result, idx) => {
                      const StatusIcon = STATUS_ICONS[result.status] || AlertTriangle;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border ${STATUS_COLORS[result.status] || STATUS_COLORS.WARNING}`}
                        >
                          <div className="flex items-start gap-3">
                            <StatusIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-dark-900 dark:text-dark-100">
                                {result.name}
                              </div>
                              {result.reason && (
                                <div className="text-sm mt-1 text-dark-700 dark:text-dark-300">
                                  {result.reason}
                                </div>
                              )}
                              {result.fix && (
                                <div className="text-sm mt-2 p-2 bg-white/50 dark:bg-dark-800/50 rounded border border-dark-200 dark:border-dark-700">
                                  <span className="font-semibold">Fix:</span> {result.fix}
                                </div>
                              )}
                              <div className="text-xs text-dark-500 dark:text-dark-500 mt-1">
                                {new Date(result.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

