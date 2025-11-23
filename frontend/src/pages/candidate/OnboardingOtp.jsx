import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { authApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

export default function OnboardingOtp() {
  const location = useLocation();
  const email = location.state?.email || '';
  const devOtp = location.state?.otp; // OTP from mock mode
  const isLogin = location.state?.isLogin ?? true; // Default to login if not specified
  const name = location.state?.name || '';
  const phone = location.state?.phone || '';
  const password = location.state?.password || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-fill OTP in development mode if provided
    if (devOtp && devOtp.length === 6) {
      setOtp(devOtp.split(''));
      // Development OTP auto-filled (no console log in production)
    }
    inputRefs.current[0]?.focus();
  }, [devOtp]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyOTP(email, otpString, {
        name,
        phone,
        password,
        isSignup: !isLogin
      });
      setAuth(response.data.user, response.data.token);
      
      // For signup (new user), always go to onboarding
      // For login (existing user), check if profile is complete
      // Always navigate to dashboard after successful auth
      // Dashboard will handle profile completeness checks
      navigate('/dashboard');
    } catch (err) {
      // Never show "backend not reachable" here - that's only for health check
      // Show actual error messages for all API errors (invalid OTP, expired, etc.)
      const errorMessage = err.response?.data?.message || 
                          err.userMessage || 
                          err.message ||
                          'Invalid OTP. Please try again.';
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const otpString = otp.join('');

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
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
          <motion.button
            variants={itemVariants}
            onClick={() => navigate(isLogin ? '/login' : '/signup')}
            className="mb-6 flex items-center gap-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>

          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-3"
            >
              Verify Your Email
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-dark-600 dark:text-dark-400"
            >
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-dark-900 dark:text-dark-100">{email}</span>
            </motion.p>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-14 h-14 text-center text-2xl font-bold
                    rounded-xl border-2 transition-all duration-300
                    bg-white dark:bg-dark-800
                    text-dark-900 dark:text-dark-100
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    ${digit
                      ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                      : error
                      ? 'border-red-500'
                      : 'border-dark-200 dark:border-dark-700'
                    }
                  `}
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otpString.length !== 6}
              loading={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </motion.form>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400"
          >
            Didn't receive the code?{' '}
            <button
              onClick={() => navigate(isLogin ? '/login' : '/signup')}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Resend
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
