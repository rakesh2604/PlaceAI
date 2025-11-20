import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PricingFailed() {
  const navigate = useNavigate();

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
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg"
          >
            <XCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-4">
            Payment Failed
          </h1>
          <p className="text-lg text-dark-600 dark:text-[#CBD5E1] mb-6">
            We couldn't process your payment. Please try again or contact support if the issue persists.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/pricing')}
              className="group"
            >
              Try Again
              <RefreshCw className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

