import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { authApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/ui/ThemeToggle';

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

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.sendOTP(email);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyOTP(email, otp, { isAdminLogin: true });
      if (response.data.user.role === 'admin') {
        setAuth(response.data.user, response.data.token);
        navigate('/admin/dashboard');
      } else {
        setError(response.data?.message || 'Access denied. Admin only.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 px-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
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
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2"
            >
              Admin{' '}
              <span className="gradient-text">Login</span>
            </motion.h1>
          </motion.div>

          {step === 'email' ? (
            <motion.form
              variants={itemVariants}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={error}
              />
              <Button
                type="submit"
                className="w-full group"
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.form>
          ) : (
            <motion.form
              variants={itemVariants}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-4 text-center">
                OTP sent to <strong>{email}</strong>
              </p>
              <Input
                label="Enter OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                error={error}
                className="text-center text-2xl tracking-widest"
              />
              <Button
                type="submit"
                className="w-full group"
                disabled={loading || otp.length !== 6}
                loading={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline w-full text-center"
              >
                Back
              </button>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
