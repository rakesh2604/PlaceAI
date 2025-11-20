import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { testConnection, processQueuedRequestsOnReconnect } from '../../services/api';
import SignupForm from '../../components/auth/SignupForm';
import Button from '../../components/ui/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SignupPage() {
  const [backendError, setBackendError] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const navigate = useNavigate();

  // Health check on mount - ONLY show error if health check fails
  useEffect(() => {
    const checkConnection = async () => {
      setTestingConnection(true);
      try {
        const result = await testConnection();
        if (result.connected) {
          console.log('✓ Backend connection successful', result.data);
          setBackendError(''); // Clear any previous errors
          // Process any queued requests now that we're connected
          await processQueuedRequestsOnReconnect();
        } else {
          // Only show "backend not reachable" if health check actually failed (network/server error)
          if (result.isNetworkError) {
            console.error('✗ Backend connection failed:', result.error, result.details);
            setBackendError('Backend server is not reachable. Please ensure it is running.');
          } else {
            // Health check returned 4xx or other non-network error - don't show backend error
            console.warn('⚠ Health check returned non-network error:', result.error);
            setBackendError('');
          }
        }
      } catch (err) {
        // This catch should rarely trigger since testConnection handles errors internally
        console.error('✗ Connection test error:', err);
        const isNetworkError = !err.response || 
                              err.code === 'ECONNREFUSED' || 
                              err.code === 'ETIMEDOUT' ||
                              err.code === 'ERR_NETWORK' ||
                              err.code === 'ERR_CONNECTION_REFUSED' ||
                              err.response?.status >= 500;
        if (isNetworkError) {
          setBackendError('Backend server is not reachable. Please ensure it is running.');
        } else {
          setBackendError(''); // Don't show backend error for other issues
        }
      } finally {
        setTestingConnection(false);
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md w-full"
      >
        <motion.div
          variants={itemVariants}
          className="glass-strong rounded-3xl shadow-2xl p-8 md:p-10"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-3"
            >
              Sign up for{' '}
              <span className="gradient-text">PlacedAI</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-dark-600 dark:text-dark-400 text-lg"
            >
              Create your account to get started
            </motion.p>
          </motion.div>

          {/* Backend error - only shown if health check failed */}
          {backendError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium mb-2">
                {backendError}
              </p>
              <p className="text-xs text-red-500 dark:text-red-500 text-center">
                To start the backend, run: <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">cd backend && npm run dev</code>
              </p>
            </motion.div>
          )}

          <SignupForm />

          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-center text-sm text-dark-500 dark:text-dark-400"
          >
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

