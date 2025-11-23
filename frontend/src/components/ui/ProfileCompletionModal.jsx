import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function ProfileCompletionModal({ isOpen, onClose, requiredAction }) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  if (!isOpen) return null;

  const handleCompleteProfile = () => {
    setIsNavigating(true);
    navigate('/onboarding');
    onClose();
  };

  const actionMessages = {
    resumeLab: {
      title: 'Complete Your Profile',
      message: 'Please complete your profile to use Resume Lab features. Add your phone number and upload your resume.',
      buttonText: 'Complete Profile'
    },
    resumeBuilder: {
      title: 'Complete Your Profile',
      message: 'Please complete your profile to use Resume Builder. Add your phone number and upload your resume.',
      buttonText: 'Complete Profile'
    },
    jobs: {
      title: 'Complete Your Profile',
      message: 'Please complete your profile to browse and apply for jobs. Add your phone number and upload your resume.',
      buttonText: 'Complete Profile'
    },
    mockInterview: {
      title: 'Complete Your Profile',
      message: 'Please complete your profile to start mock interviews. Add your phone number and upload your resume.',
      buttonText: 'Complete Profile'
    },
    default: {
      title: 'Complete Your Profile',
      message: 'Please complete your profile to access this feature.',
      buttonText: 'Complete Profile'
    }
  };

  const config = actionMessages[requiredAction] || actionMessages.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-[#001D3D] rounded-2xl shadow-2xl max-w-md w-full border border-dark-200 dark:border-[#003566]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-[#003566]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                    {config.title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-[#003566] transition-colors"
                >
                  <X className="w-5 h-5 text-dark-600 dark:text-[#CBD5E1]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-dark-600 dark:text-[#CBD5E1] mb-6">
                  {config.message}
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCompleteProfile}
                    disabled={isNavigating}
                    loading={isNavigating}
                    className="flex-1 group"
                  >
                    {config.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

