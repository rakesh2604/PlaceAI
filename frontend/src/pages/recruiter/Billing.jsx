import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { billingApi } from '../../services/recruiterApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RecruiterBilling() {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await billingApi.getPlans();
      setPlans(response.data.plans || {});
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    setProcessing(true);
    try {
      const response = await billingApi.createCheckoutSession(planId);
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      alert('Failed to start checkout. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2">
            Billing &{' '}
            <span className="gradient-text">Plans</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Choose a plan that fits your needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8"
        >
          {Object.entries(plans).map(([planId, plan], index) => (
            <motion.div
              key={planId}
              variants={containerVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`
                relative rounded-3xl p-8
                ${index === 1
                  ? 'glass-strong border-2 border-primary-500 shadow-glow-lg scale-105'
                  : 'glass border border-dark-200 dark:border-dark-700'
                }
              `}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                  ${plan.price}
                </span>
                <span className="text-dark-600 dark:text-dark-400">/month</span>
              </div>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                {plan.description}
              </p>
              <Button
                onClick={() => handlePurchase(planId)}
                className="w-full"
                disabled={processing}
                loading={processing}
                variant={index === 1 ? 'primary' : 'outline'}
              >
                {processing ? 'Processing...' : 'Purchase'}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
