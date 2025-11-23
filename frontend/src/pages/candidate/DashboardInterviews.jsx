import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { interviewApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProfileCompletionModal from '../../components/ui/ProfileCompletionModal';

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

export default function DashboardInterviews() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await interviewApi.getMyInterviews();
      setInterviews(response.data.interviews || []);
    } catch (err) {
      // Silently handle error - empty state will be shown
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-4">
            My{' '}
            <span className="gradient-text">Interviews</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            View all your interview results and performance
          </p>
        </motion.div>

        {interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Video className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-dark-600 dark:text-dark-400 mb-6 text-lg">
                No interviews yet
              </p>
              <Button
                onClick={() => {
                  if (!user?.profileCompleted) {
                    setShowProfileModal(true);
                  } else {
                    navigate('/interview/intro');
                  }
                }}
              >
                Start Your First Interview
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {interviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-1">
                            {interview.jobId?.title || 'Interview'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-dark-500 dark:text-dark-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(interview.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          interview.status === 'completed' ? 'success' : 'warning'
                        }
                      >
                        {interview.status}
                      </Badge>
                      {interview.status === 'completed' && interview.aiScores && (
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            <div>
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {interview.aiScores.overall}/10
                              </div>
                              <div className="text-xs text-dark-500 dark:text-dark-400">
                                Overall Score
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {interview.status === 'completed' && (
                        <Link to={`/interview/result/${interview._id}`}>
                          <Button size="sm" className="group">
                            View Results
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        requiredAction="mockInterview"
      />
    </div>
  );
}
