import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import PricingCard from '../components/ui/PricingCard';
import SectionHeader from '../components/ui/SectionHeader';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import Modal from '../components/ui/Modal';
import api from '../services/api';

// Import plans config (in production, fetch from API)
const plans = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfect for getting started',
    features: [
      '3 AI interviews per month',
      '3 ATS resume checks per month',
      '2 resume generations per month',
      'Basic job recommendations',
      'Email support'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 499,
    priceYearly: 4990,
    description: 'For serious job seekers',
    features: [
      '40 AI interviews per month',
      '40 ATS resume checks per month',
      '30 resume generations per month',
      'Advanced job matching',
      'Priority support',
      'Interview analytics',
      'Resume templates'
    ],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 9999,
    priceYearly: 99990,
    description: 'For colleges and institutions',
    features: [
      'Unlimited AI interviews',
      'Unlimited ATS checks',
      'Unlimited resume generations',
      'Bulk student management',
      'Custom integrations',
      'Dedicated support',
      'Analytics dashboard'
    ]
  }
};

export default function Pricing() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [upgradeModal, setUpgradeModal] = useState({ open: false, plan: null });
  const [loading, setLoading] = useState(false);

  const pricingPlans = [
    plans.free,
    plans.premium,
    plans.enterprise
  ];

  const handlePlanSelect = (plan) => {
    if (!token || !user) {
      // Not logged in - navigate to signup with plan
      if (plan.id === 'free') {
        navigate('/login');
      } else {
        navigate('/login', { state: { planId: plan.id } });
      }
      return;
    }

    const userPlan = user.planId || 'free';
    
    // If already on this plan, do nothing
    if (userPlan === plan.id) {
      return;
    }

    // If trying to downgrade, show info
    const planHierarchy = { free: 0, premium: 1, enterprise: 2 };
    const selectedPlanLevel = planHierarchy[plan.id];
    const currentPlanLevel = planHierarchy[userPlan];
    
    if (selectedPlanLevel < currentPlanLevel) {
      alert('To downgrade, please contact support.');
      return;
    }

    // If free plan selected and user is on paid plan, show info
    if (plan.id === 'free' && userPlan !== 'free') {
      alert('To switch to the free plan, please contact support.');
      return;
    }

    // Upgrade - show modal
    setUpgradeModal({ open: true, plan });
  };

  const handleUpgrade = async () => {
    if (!upgradeModal.plan) return;

    setLoading(true);
    try {
      // Create checkout session
      const response = await api.post('/billing/create-checkout-session', {
        planId: upgradeModal.plan.id,
        period: billingPeriod
      });

      if (response.data?.url) {
        // In development, the backend directly upgrades the user - navigate to success
        if (response.data.message === 'Plan upgraded successfully') {
          navigate(`/pricing/success?session_id=${response.data.sessionId}`);
        } else {
          // In production with Stripe, redirect to checkout URL
          // Stripe will redirect back to success/failure page after payment
          window.location.href = response.data.url;
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.userMessage || 
                          'Failed to start checkout. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
      setUpgradeModal({ open: false, plan: null });
    }
  };

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[#F5F8FF] dark:bg-dark-900" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <SectionHeader
            title="Simple, Transparent Pricing"
            subtitle="Choose the plan that works best for you"
          />

          {/* Billing Toggle */}
          <motion.div 
            className="flex justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glassmorphism rounded-full p-1.5 inline-flex gap-2 border border-cyan-500/30">
              <motion.button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-dark-600 dark:text-dark-400'
                }`}
              >
                Monthly
              </motion.button>
              <motion.button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-dark-600 dark:text-dark-400'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </motion.button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {pricingPlans.map((plan, index) => {
              const isCurrentPlan = user?.planId === plan.id;
              const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <PricingCard
                    name={plan.name}
                    price={price}
                    period={billingPeriod === 'monthly' ? 'month' : 'year'}
                    description={plan.description}
                    features={plan.features}
                    popular={plan.popular}
                    delay={index * 0.1}
                    onSelect={() => handlePlanSelect(plan)}
                    isCurrentPlan={isCurrentPlan}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      <Modal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, plan: null })}
        title={`Upgrade to ${upgradeModal.plan?.name}`}
      >
        {upgradeModal.plan && (
          <div className="space-y-4">
            <p className="text-dark-600 dark:text-dark-400">
              You're about to upgrade to the <strong>{upgradeModal.plan.name}</strong> plan.
            </p>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-2">
                What you'll get:
              </p>
              <ul className="space-y-1 text-sm text-dark-700 dark:text-dark-300">
                {upgradeModal.plan.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setUpgradeModal({ open: false, plan: null })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : `Upgrade to ${upgradeModal.plan.name}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}

