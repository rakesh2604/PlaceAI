import { motion } from 'framer-motion';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function LimitReachedModal({ isOpen, onClose, feature, limit, used }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Limit Reached">
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-500/30 rounded-xl">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-dark-900 dark:text-dark-100 mb-2">
              You've reached your Free plan limit
            </h3>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              You've used {used} out of {limit} {feature} this month. Upgrade to Premium to continue.
            </p>
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
          <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-2">
            With Premium, you get:
          </p>
          <ul className="space-y-1 text-sm text-dark-700 dark:text-dark-300">
            <li>• 40 {feature} per month (vs {limit} on Free)</li>
            <li>• Advanced analytics and insights</li>
            <li>• Priority support</li>
            <li>• Resume templates and more</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Back to Dashboard
          </Button>
          <Link to="/pricing" className="flex-1">
            <Button className="w-full group">
              Upgrade to Premium
              <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}

