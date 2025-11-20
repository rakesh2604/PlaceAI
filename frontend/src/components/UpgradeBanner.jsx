import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from './ui/Button';

export default function UpgradeBanner({ onClose, variant = 'dashboard' }) {
  const { user } = useAuthStore();
  const isFree = !user?.planId || user.planId === 'free';

  if (!isFree) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 ${
        variant === 'dashboard' ? 'p-6 mb-6' : 'p-4'
      }`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            You're on the Free plan
          </h3>
          <p className="text-dark-600 dark:text-dark-400 mb-4 text-sm">
            Get more AI interviews, ATS checks, and resume generations with Premium. Unlock unlimited practice and advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/pricing">
              <Button size="sm" className="group">
                View Plans
                <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="sm" variant="outline">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

