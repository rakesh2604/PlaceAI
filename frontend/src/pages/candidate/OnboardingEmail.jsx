import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles } from 'lucide-react';
import { authApi } from '../../services/candidateApi';
import { testConnection } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ChatWidget from '../../components/ui/ChatWidget';

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

export default function OnboardingEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const navigate = useNavigate();

  // Health check on mount - only show "backend not reachable" if health check fails
  useEffect(() => {
    const checkConnection = async () => {
      setTestingConnection(true);
      try {
        const result = await testConnection();
        if (result.connected) {
          setError(''); // Clear any previous errors
        } else {
          // Only show "backend not reachable" if health check actually failed (network/server error)
          if (result.isNetworkError) {
            setError('Backend server is not reachable. Please ensure it is running.');
          } else {
            // Health check passed but something else happened - don't show backend error
            setError('');
          }
        }
      } catch (err) {
        // Only show backend error if it's a network/server error
        const isNetworkError = !err.response || 
                              err.code === 'ECONNREFUSED' || 
                              err.code === 'ETIMEDOUT' ||
                              err.code === 'ERR_NETWORK' ||
                              err.response?.status >= 500;
        if (isNetworkError) {
          setError('Backend server is not reachable. Please ensure it is running.');
        } else {
          setError(''); // Don't show backend error for other issues
        }
      } finally {
        setTestingConnection(false);
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.sendOTP(email);
      
      // If in development mode and OTP is returned (mock mode), show it
      if (response.data?.otp && import.meta.env.DEV) {
        alert(`Development Mode: Your OTP is ${response.data.otp}\n\n${response.data.note || ''}`);
      }
      
      navigate('/verify-otp', { state: { email, otp: response.data?.otp } });
    } catch (err) {
      // Only show "backend unreachable" if it's actually a network/server error
      // For validation errors (4xx), show the actual error message
      const isNetworkError = !err.response || 
                            err.code === 'ECONNREFUSED' || 
                            err.code === 'ETIMEDOUT' || 
                            err.code === 'ERR_NETWORK' ||
                            err.message.includes('Network Error');
      const isServerError = err.response?.status >= 500;
      
      if (isNetworkError || isServerError) {
        setError('Backend server is not reachable. Please ensure it is running.');
      } else {
        // Show the actual error message for validation errors, wrong OTP, etc.
        const errorMessage = err.userMessage || 
                            err.response?.data?.message || 
                            err.response?.data?.errors?.[0]?.msg ||
                            err.message || 
                            'Failed to send OTP. Please check your email and try again.';
        setError(errorMessage);
      }
      
      // Error handled via UI message above
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary-300/20 dark:bg-primary-800/20 rounded-full blur-3xl"
        />
      </div>

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
              Welcome to{' '}
              <span className="gradient-text">PlacedAI</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-dark-600 dark:text-dark-400 text-lg"
            >
              AI-Powered Job Preparation for Indian Students
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-dark-500 dark:text-dark-400 text-sm mt-2"
            >
              Enter your email to get started with AI-powered interviews
            </motion.p>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              error={error}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </motion.form>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-center text-sm text-dark-500 dark:text-dark-400"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </a>
          </motion.p>
        </motion.div>
      </motion.div>
      <ChatWidget />
    </div>
  );
}
