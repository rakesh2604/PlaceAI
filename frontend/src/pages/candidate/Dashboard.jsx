import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Video, 
  Plus, 
  TrendingUp, 
  Award, 
  Users, 
  ArrowRight,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { interviewApi, optInApi } from '../../services/candidateApi';
import Button from '../../components/ui/Button';
import AnimatedCard from '../../components/ui/AnimatedCard';
import TutorialPopup from '../../components/ui/TutorialPopup';
import ChatWidget from '../../components/ui/ChatWidget';
import UpgradeBanner from '../../components/UpgradeBanner';

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

const quickActions = [
  {
    icon: Video,
    title: 'Start Interview',
    description: 'Begin a new AI-powered interview',
    link: '/interview/intro',
    color: 'from-blue-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    icon: Award,
    title: 'Interview Results',
    description: 'Check your interview performance',
    link: '/dashboard/interviews',
    color: 'from-green-500 to-green-600',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    icon: Briefcase,
    title: 'Resume Lab',
    description: 'Analyze ATS score and optimize your resume',
    link: '/resume-lab',
    color: 'from-purple-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Generate resumes with AI-powered templates',
    link: '/resume-builder',
    color: 'from-indigo-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  },
  {
    icon: Target,
    title: 'Explore Jobs',
    description: 'Find opportunities matching your profile',
    link: '/jobs',
    color: 'from-orange-500 to-orange-600',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Usage & Limits',
    description: 'Track your monthly usage and plan limits',
    link: '/usage',
    color: 'from-pink-500 to-pink-600',
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
  },
];

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <AnimatedCard className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          {trend}
        </div>
      )}
    </div>
    <div className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-1">
      {value}
    </div>
    <div className="text-sm text-dark-600 dark:text-dark-400">{label}</div>
  </AnimatedCard>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    lastScore: 0,
    resumeStrength: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  // Note: Profile completion redirects are handled at route level, not here
  // Dashboard should always be accessible - specific features will check profile completion

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [interviewsResponse, optInsResponse] = await Promise.all([
          interviewApi.getMyInterviews().catch(() => ({ data: [] })),
          optInApi.getRequests().catch(() => ({ data: [] })),
        ]);
        
        setStats({
          totalInterviews: interviewsResponse.data?.length || 0,
          lastScore: interviewsResponse.data?.[0]?.overallScore || 0,
          resumeStrength: user?.resumeScore || 75,
          pendingRequests: optInsResponse.data?.filter(opt => !opt.accepted)?.length || 0,
        });
      } catch (error) {
        // Silently handle error - stats will show defaults
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <TutorialPopup />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Upgrade Banner */}
        {!user?.isPremium && <UpgradeBanner variant="dashboard" />}
        
        {/* Welcome Header - Modern SaaS Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-manrope font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {user?.name || user?.email?.split('@')[0] || 'Student'}
                </span>
              </h1>
              <p className="text-lg text-dark-600 dark:text-[#CBD5E1]">
                Ready to ace your next interview? Let's continue your journey to success.
              </p>
            </div>
            <Link to="/interview/intro">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="group shadow-lg shadow-cyan-500/20">
                  Start New Interview
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid - Modern SaaS Style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                {stats.totalInterviews > 0 && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    +2 this week
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                {stats.totalInterviews}
              </div>
              <div className="text-sm text-dark-600 dark:text-[#CBD5E1]">Total Interviews</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                {stats.lastScore > 80 && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    +5%
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                {stats.lastScore || 'N/A'}
              </div>
              <div className="text-sm text-dark-600 dark:text-[#CBD5E1]">Last Score</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                  {stats.resumeStrength > 80 ? 'Strong' : 'Good'}
                </span>
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                {stats.resumeStrength}%
              </div>
              <div className="text-sm text-dark-600 dark:text-[#CBD5E1]">Resume Strength</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {stats.pendingRequests > 0 && (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                {stats.pendingRequests}
              </div>
              <div className="text-sm text-dark-600 dark:text-[#CBD5E1]">Pending Requests</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Grid - Modern SaaS Style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.link}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                >
                  <Link to={action.link}>
                    <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all group cursor-pointer h-full">
                      <div className={`w-12 h-12 rounded-lg ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-medium text-sm group-hover:gap-2 transition-all">
                        Get started
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pending Recruiter Requests */}
        {stats.pendingRequests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="p-6 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA] mb-1">
                    {stats.pendingRequests} Pending Recruiter Request{stats.pendingRequests > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4">
                    Recruiters want to connect with you. Review and respond to their requests.
                  </p>
                  <Link to="/dashboard/optins">
                    <Button size="sm" variant="outline" className="border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20">
                      View Requests
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Completion Reminder */}
        {!user?.selectedRoleId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-900/50 bg-cyan-50 dark:bg-cyan-900/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-dark-600 dark:text-[#CBD5E1] mb-4">
                  Select a job role to start interviewing and unlock your career potential. 
                  Get personalized interview questions and job recommendations.
                </p>
                <Link to="/dashboard/jobs">
                  <Button size="sm" className="group">
                    Browse Jobs & Select Role
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Performance */}
        {stats.totalInterviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA]">
                  Your Performance
                </h3>
              </div>
              <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4">
                Track your interview performance over time and see how you're improving.
              </p>
              <Link to="/dashboard/interviews">
                <Button variant="outline" size="sm">
                  View All Interviews
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
