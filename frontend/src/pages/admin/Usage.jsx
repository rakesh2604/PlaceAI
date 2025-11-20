import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { Link } from 'react-router-dom';

export default function AdminUsage() {
  const { logout } = useAuthStore();
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await adminApi.getUsage();
      setUsageData(response.data);
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const usageByPlan = usageData?.usageByPlan || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass-strong border-b border-dark-200/50 dark:border-dark-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-2xl font-display font-bold gradient-text">
                Admin Panel
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/admin/dashboard" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Dashboard</Link>
                <Link to="/admin/users" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Users</Link>
                <Link to="/admin/interviews" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Interviews</Link>
                <Link to="/admin/payments" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Payments</Link>
                <Link to="/admin/ats-scores" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">ATS Scores</Link>
                <Link to="/admin/usage" className="text-primary-600 dark:text-primary-400 font-medium">Usage</Link>
                <Link to="/admin/support" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Support</Link>
                <Link to="/admin/settings" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Settings</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            Usage Overview
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            Monitor AI feature usage across all users
          </p>
        </div>

        {/* Usage by Plan */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {usageByPlan.map((plan) => (
            <motion.div
              key={plan._id || 'unknown'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={plan._id === 'premium' ? 'success' : plan._id === 'enterprise' ? 'warning' : 'default'}>
                    {plan._id || 'free'}
                  </Badge>
                  <Users className="w-5 h-5 text-dark-400" />
                </div>
                <div className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                  {plan.count || 0}
                </div>
                <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">Users</p>
                <div className="space-y-2 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400">Interviews:</span>
                    <span className="font-semibold text-dark-900 dark:text-dark-100">{plan.totalInterviews || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400">ATS Checks:</span>
                    <span className="font-semibold text-dark-900 dark:text-dark-100">{plan.totalATSChecks || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400">Resume Gen:</span>
                    <span className="font-semibold text-dark-900 dark:text-dark-100">{plan.totalResumeGen || 0}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Users Usage */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-6">
            Recent Users Usage
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Interviews</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">ATS Checks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Resume Gen</th>
                </tr>
              </thead>
              <tbody>
                {usageData?.users?.slice(0, 20).map((user) => (
                  <motion.tr
                    key={user._id}
                    whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
                    className="border-b border-dark-100 dark:border-dark-800"
                  >
                    <td className="py-3 px-4 font-medium text-dark-900 dark:text-dark-100">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.planId === 'premium' ? 'success' : user.planId === 'enterprise' ? 'warning' : 'default'}>
                        {user.planId || 'free'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-dark-300">
                      {user.usage?.aiInterviewsThisMonth || 0}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-dark-300">
                      {user.usage?.atsChecksThisMonth || 0}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-dark-300">
                      {user.usage?.resumeGenerationsThisMonth || 0}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

