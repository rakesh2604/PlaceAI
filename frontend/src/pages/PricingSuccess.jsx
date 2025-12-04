import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { userApi } from '../services/candidateApi';
import api from '../services/api';

export default function PricingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        // If no session_id, redirect to pricing
        if (!sessionId) {
          console.error('No session_id provided');
          navigate('/pricing');
          return;
        }

        // Verify payment with backend
        const verifyResponse = await api.get(`/billing/verify-payment/${sessionId}`);
        
        if (!verifyResponse.data?.valid) {
          // Payment not valid, redirect to pricing
          console.error('Payment verification failed:', verifyResponse.data?.message);
          navigate('/pricing?error=payment_verification_failed');
          return;
        }

        // Payment is valid, refresh user data
        const response = await userApi.getMe();
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        // Redirect to pricing on error
        navigate('/pricing?error=payment_verification_error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, updateUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000814]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000814] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="p-8 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-dark-600 dark:text-[#CBD5E1] mb-6">
            Your plan has been upgraded successfully. You now have access to premium features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="group"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/usage')}
            >
              View Usage
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

