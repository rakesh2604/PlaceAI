import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../services/candidateApi';
import Button from '../../components/ui/Button';
import AnimatedCard from '../../components/ui/AnimatedCard';
import UpgradeBanner from '../../components/UpgradeBanner';
import { Link } from 'react-router-dom';

const UsageBar = ({ label, used, limit, color = 'from-cyan-500 to-blue-600' }) => {
  const percentage = limit === 'unlimited' ? 0 : Math.min(100, (used / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  const remaining = limit === 'unlimited' ? 'Unlimited' : Math.max(0, limit - used);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-semibold text-dark-900 dark:text-[#F8F9FA]">{label}</span>
          {!isAtLimit && (
            <p className="text-xs text-dark-500 dark:text-[#94A3B8] mt-0.5">
              {remaining} {limit === 'unlimited' ? '' : 'remaining'}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${isAtLimit ? 'text-red-500 dark:text-red-400' : isNearLimit ? 'text-orange-500 dark:text-orange-400' : 'text-dark-900 dark:text-[#F8F9FA]'}`}>
            {used} / {limit === 'unlimited' ? '∞' : limit}
          </span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-dark-100 dark:bg-[#003566] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${color} rounded-full ${isAtLimit ? 'bg-red-500' : ''} shadow-lg`}
        />
      </div>
      {isNearLimit && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs flex items-center gap-1.5 font-medium ${
            isAtLimit 
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg' 
              : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {isAtLimit ? 'Limit reached - Upgrade to continue' : 'Approaching limit - Consider upgrading'}
        </motion.p>
      )}
    </div>
  );
};

export default function Usage() {
  const { user } = useAuthStore();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await userApi.getMe();
        if (response.data?.user) {
          const userData = response.data.user;
          setUsage({
            aiInterviews: userData.usage?.aiInterviewsThisMonth || 0,
            atsChecks: userData.usage?.atsChecksThisMonth || 0,
            resumeGenerations: userData.usage?.resumeGenerationsThisMonth || 0
          });
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsage();
    }
  }, [user]);

  const planId = user?.planId || 'free';
  const limits = {
    free: { aiInterviews: 3, atsChecks: 3, resumeGenerations: 2 },
    premium: { aiInterviews: 40, atsChecks: 40, resumeGenerations: 30 },
    enterprise: { aiInterviews: 'unlimited', atsChecks: 'unlimited', resumeGenerations: 'unlimited' }
  };

  const currentLimits = limits[planId] || limits.free;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-[#F8F9FA]">
                Usage & Limits
              </h1>
              <p className="text-dark-600 dark:text-[#CBD5E1] mt-1">
                Track your monthly usage and plan limits
              </p>
            </div>
          </div>
        </motion.div>

        {!user?.isPremium && <UpgradeBanner variant="dashboard" />}

        {/* Usage Card - Modern SaaS Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                Current Plan: <span className="capitalize">{planId}</span>
              </h2>
              <p className="text-sm text-dark-600 dark:text-[#CBD5E1]">
                Usage resets monthly on the 1st
              </p>
            </div>
            {planId === 'free' && (
              <Link to="/pricing">
                <Button className="group">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-8">
            <UsageBar
              label="AI Interviews"
              used={usage?.aiInterviews || 0}
              limit={currentLimits.aiInterviews}
              color="from-blue-500 to-cyan-500"
            />
            <UsageBar
              label="ATS Resume Checks"
              used={usage?.atsChecks || 0}
              limit={currentLimits.atsChecks}
              color="from-cyan-500 to-indigo-500"
            />
            <UsageBar
              label="Resume Generations"
              used={usage?.resumeGenerations || 0}
              limit={currentLimits.resumeGenerations}
              color="from-indigo-500 to-purple-500"
            />
          </div>
        </motion.div>

        {planId === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-900/50 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
                  Ready for more?
                </h3>
                <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4">
                  Upgrade to Premium and get 40 interviews, 40 ATS checks, and 30 resume generations per month.
                </p>
                <Link to="/pricing">
                  <Button size="sm" className="group">
                    View Premium Plans
                    <Sparkles className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

