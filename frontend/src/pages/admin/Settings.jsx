import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Badge from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  const { logout } = useAuthStore();
  const [plans, setPlans] = useState({
    free: { active: true, name: 'Free Plan' },
    premium: { active: true, name: 'Premium Plan' },
    enterprise: { active: true, name: 'Enterprise Plan' }
  });

  const handleTogglePlan = (planId) => {
    setPlans(prev => ({
      ...prev,
      [planId]: { ...prev[planId], active: !prev[planId].active }
    }));
  };

  const handleSave = () => {
    // In a real app, this would call an API to update plan settings
    alert('Settings saved! (This is a stub - implement API call in production)');
  };

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
                <Link to="/admin/usage" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Usage</Link>
                <Link to="/admin/support" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Support</Link>
                <Link to="/admin/settings" className="text-primary-600 dark:text-primary-400 font-medium">Settings</Link>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            Settings
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            Configure system settings and plans
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">
              Plan Configuration
            </h2>
          </div>
          <p className="text-sm text-dark-600 dark:text-dark-400 mb-6">
            Enable or disable subscription plans. Disabled plans will not be available for new signups.
          </p>
          
          <div className="space-y-4">
            {Object.entries(plans).map(([planId, plan]) => (
              <motion.div
                key={planId}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-700 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-dark-100">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    Plan ID: {planId}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={plan.active ? 'success' : 'default'}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => handleTogglePlan(planId)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      plan.active ? 'bg-primary-600' : 'bg-dark-300 dark:bg-dark-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        plan.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">
              System Information
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-600 dark:text-dark-400">Version:</span>
              <span className="font-medium text-dark-900 dark:text-dark-100">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-600 dark:text-dark-400">Environment:</span>
              <span className="font-medium text-dark-900 dark:text-dark-100">
                {import.meta.env.MODE || 'development'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-600 dark:text-dark-400">API Base URL:</span>
              <span className="font-medium text-dark-900 dark:text-dark-100">
                {import.meta.env.VITE_API_BASE_URL || '/api'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

