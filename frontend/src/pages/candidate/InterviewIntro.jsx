import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, CheckCircle2, Camera, Mic, Clock, AlertCircle, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { interviewApi, userApi } from '../../services/candidateApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const instructions = [
  { icon: Camera, text: 'Make sure you have a good internet connection' },
  { icon: Mic, text: 'Find a quiet, well-lit environment' },
  { icon: Video, text: 'Allow camera and microphone access when prompted' },
  { icon: CheckCircle2, text: 'Answer each question thoughtfully' },
  { icon: Clock, text: 'You can take your time - there\'s no rush' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function InterviewIntro() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasRole = useMemo(() => {
    return !!(user?.selectedRoleId || location.state?.jobId);
  }, [user?.selectedRoleId, location.state?.jobId]);

  useEffect(() => {
    // If already has role, skip fetching
    if (hasRole) {
      setChecking(false);
      return;
    }

    // If user already loaded but no role, don't fetch again
    if (user && !user.selectedRoleId) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    let timeoutId;
    setChecking(true);
    
    const fetchUser = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Request timeout')), 10000);
        });

        const response = await Promise.race([
          userApi.getMe(),
          timeoutPromise
        ]);

        if (isMounted && response?.data?.user) {
          updateUser(response.data.user);
        }
      } catch (err) {
        // Silently handle error - user state will remain unchanged
        console.error('Failed to fetch user:', err);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setChecking(false);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasRole, user, updateUser]);

  const handleStart = async () => {
    const jobId = user?.selectedRoleId || location.state?.jobId;
    
    if (!jobId) {
      alert('Please select a role first. You will be redirected to browse jobs.');
      navigate('/dashboard/jobs');
      return;
    }

    setLoading(true);
    try {
      const response = await interviewApi.start(jobId);
      navigate('/interview/live-new', { state: { interview: response.data.interview } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start interview. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checking && !hasRole) {
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-glow-lg"
            >
              <Video className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-4"
            >
              AI-Powered{' '}
              <span className="gradient-text">Interview</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-dark-600 dark:text-dark-400 text-lg"
            >
              Get ready for your interview. We'll ask you a series of questions and record your responses.
            </motion.p>
          </motion.div>

          <Card className="p-8 md:p-10 mb-8">
            <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary-500" />
              Instructions
            </h3>
            <div className="space-y-4">
              {instructions.map((instruction, index) => {
                const Icon = instruction.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-dark-700 dark:text-dark-300 pt-2">
                      {instruction.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {!hasRole && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Select a Job Role First
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                    To start your AI-powered interview, please select a job role from the available positions. This helps us customize the interview questions for your target role.
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/jobs')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs & Select Role
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Go Back
            </Button>
            <Button
              onClick={handleStart}
              disabled={loading || !hasRole}
              loading={loading}
              className="group min-w-[200px]"
            >
              {loading ? 'Starting...' : 'Start Interview'}
              <Video className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
