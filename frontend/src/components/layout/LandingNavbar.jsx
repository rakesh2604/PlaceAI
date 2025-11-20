import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

export default function LandingNavbar() {
  const { user, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleBrandClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on landing page - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to landing and scroll to top after load
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glassmorphism-strong border-b border-dark-200/50 dark:border-dark-700/50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a 
            href="/" 
            onClick={handleBrandClick}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-manrope font-bold gradient-text">
              PlacedAI
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#how-it-works" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              Pricing
            </a>
            {token && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <ThemeToggle />
                <Link to="/dashboard">
                  <Button size="sm">Go to Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/login">
                  <Button size="sm" variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-dark-200 dark:border-dark-700"
        >
          <div className="px-4 py-4 space-y-3">
            <a href="#how-it-works" className="block text-dark-700 dark:text-dark-300 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#pricing" className="block text-dark-700 dark:text-dark-300 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            {token && user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

