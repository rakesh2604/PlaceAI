import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, CreditCard, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useState } from 'react';

const navItems = [
  { icon: Briefcase, label: 'Jobs', link: '/recruiter/jobs' },
  { icon: Users, label: 'Candidates', link: '/recruiter/candidates' },
  { icon: FileText, label: 'Opt-Ins', link: '/recruiter/optins' },
  { icon: CreditCard, label: 'Billing', link: '/recruiter/billing' },
];

const quickStats = [
  { label: 'Active Jobs', value: '12', color: 'from-blue-500 to-blue-600' },
  { label: 'Candidates', value: '48', color: 'from-green-500 to-green-600' },
  { label: 'Opt-Ins', value: '23', color: 'from-primary-500 to-primary-600' },
];

export default function RecruiterDashboard() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass-strong border-b border-dark-200/50 dark:border-dark-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/recruiter/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-display font-bold gradient-text">
                  PlacedAI
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.link}
                      to={item.link}
                      className="flex items-center gap-2 text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
              <button
                className="md:hidden p-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2">
            Recruiter{' '}
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Welcome, {user?.email}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-600 dark:text-dark-400">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={item.link}>
                  <Card className="h-full p-6 group cursor-pointer">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
                      {item.label}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 text-sm">
                      {item.label === 'Jobs' && 'Manage your job postings'}
                      {item.label === 'Candidates' && 'Find and connect with candidates'}
                      {item.label === 'Opt-Ins' && 'Track your connection requests'}
                      {item.label === 'Billing' && 'Manage your subscription'}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
