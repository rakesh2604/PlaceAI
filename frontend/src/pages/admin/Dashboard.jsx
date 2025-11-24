import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, FileText, DollarSign, CheckCircle2, XCircle, 
  BarChart3, MessageSquare, Settings, ArrowRight, TrendingUp, 
  Clock, Award, Target, Sparkles 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const statCards = [
  { icon: Users, label: 'Total Users', key: 'totalUsers', color: 'from-blue-500 to-blue-600', link: '/admin/users' },
  { icon: Briefcase, label: 'Total Jobs', key: 'totalJobs', color: 'from-green-500 to-green-600' },
  { icon: FileText, label: 'Interviews', key: 'totalInterviews', color: 'from-purple-500 to-purple-600', link: '/admin/interviews' },
  { icon: DollarSign, label: 'Total Revenue', key: 'totalRevenue', color: 'from-yellow-500 to-yellow-600', link: '/admin/payments' },
  { icon: BarChart3, label: 'ATS Checks', key: 'totalATSChecks', color: 'from-cyan-500 to-cyan-600', link: '/admin/ats-scores' },
  { icon: MessageSquare, label: 'Support Tickets', key: 'totalTickets', color: 'from-orange-500 to-orange-600', link: '/admin/support' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalInterviews: 0,
    totalRevenue: 0,
    totalATSChecks: 0,
    totalTickets: 0
  });
  const [users, setUsers] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, recruitersRes, interviewsRes, paymentsRes, jobsRes, statsRes, ticketsRes] = await Promise.all([
        adminApi.getUsers().catch(() => ({ data: { users: [] } })),
        adminApi.getRecruiters().catch(() => ({ data: { recruiters: [] } })),
        adminApi.getInterviews().catch(() => ({ data: { interviews: [] } })),
        api.get('/billing/history').catch(() => ({ data: { payments: [] } })),
        api.get('/jobs').catch(() => ({ data: { jobs: [] } })),
        adminApi.getStats().catch(() => ({ data: {} })),
        adminApi.getSupportTickets().catch(() => ({ data: { tickets: [], total: 0 } }))
      ]);

      const usersData = usersRes.data?.users || [];
      const recruitersData = recruitersRes.data?.recruiters || [];
      const interviewsData = interviewsRes.data?.interviews || [];
      const paymentsData = paymentsRes.data?.payments || [];
      const jobsData = jobsRes.data?.jobs || [];
      const statsData = statsRes.data || {};
      const ticketsData = ticketsRes.data?.tickets || [];
      const ticketsTotal = ticketsRes.data?.total || ticketsData.length;

      setUsers(usersData);
      setRecruiters(recruitersData);
      setInterviews(interviewsData);
      setPayments(paymentsData);

      // Calculate stats
      const totalRevenue = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalUsers: usersData.length,
        totalJobs: jobsData.length,
        totalInterviews: interviewsData.length,
        totalRevenue,
        totalATSChecks: statsData.totalATSReports || 0,
        totalTickets: statsData.totalSupportTickets || ticketsTotal
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecruiter = async (id, isApproved) => {
    try {
      await adminApi.updateRecruiterStatus(id, isApproved);
      loadData();
    } catch (err) {
      console.error('Failed to update recruiter:', err);
      alert('Failed to update recruiter status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000814]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-dark-600 dark:text-[#CBD5E1]">
            Manage your platform and monitor user activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const value = stat.key === 'totalRevenue'
              ? `₹${(stats[stat.key] || 0).toLocaleString()}`
              : stats[stat.key] || 0;

            const content = (
              <motion.div
                key={stat.key}
                variants={containerVariants}
                whileHover={{ y: -4 }}
                className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {index === 3 && stats.totalRevenue > 0 && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                  {value}
                </div>
                <div className="text-sm text-dark-600 dark:text-[#CBD5E1]">
                  {stat.label}
                </div>
              </motion.div>
            );

            return stat.link ? (
              <Link key={stat.key} to={stat.link}>
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </motion.div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                Recent Users
              </h2>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-[#003566] hover:bg-dark-100 dark:hover:bg-[#003566] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-900 dark:text-[#F8F9FA]">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-dark-500 dark:text-[#94A3B8]">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Recruiters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                Pending Recruiters
              </h2>
              <Badge variant="warning" className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                {recruiters.filter(r => !r.isApproved).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {recruiters.filter(r => !r.isApproved).slice(0, 5).map((recruiter) => (
                <div
                  key={recruiter._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-[#003566] hover:bg-dark-100 dark:hover:bg-[#003566] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                      {recruiter.companyName?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-900 dark:text-[#F8F9FA]">
                        {recruiter.companyName}
                      </p>
                      <p className="text-xs text-dark-500 dark:text-[#94A3B8]">
                        {recruiter.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRecruiter(recruiter._id, true)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveRecruiter(recruiter._id, false)}
                      className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {recruiters.filter(r => !r.isApproved).length === 0 && (
                <p className="text-sm text-dark-500 dark:text-[#94A3B8] text-center py-8">
                  No pending recruiters
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Manage Users', link: '/admin/users', color: 'from-blue-500 to-blue-600' },
              { icon: DollarSign, label: 'View Payments', link: '/admin/payments', color: 'from-green-500 to-green-600' },
              { icon: FileText, label: 'ATS Scores', link: '/admin/ats-scores', color: 'from-purple-500 to-purple-600' },
              { icon: MessageSquare, label: 'Support', link: '/admin/support', color: 'from-orange-500 to-orange-600' },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={action.link}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
                      {action.label}
                    </h3>
                    <div className="flex items-center text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                      Go to page
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Interviews */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                  Recent Interviews
                </h2>
                <Link to="/admin/interviews">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {interviews.slice(0, 5).map((interview) => (
                  <div
                    key={interview._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-dark-50 dark:bg-[#003566] hover:bg-dark-100 dark:hover:bg-[#003566] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark-900 dark:text-[#F8F9FA]">
                          {interview.jobId?.title || 'Interview'}
                        </p>
                        <p className="text-sm text-dark-500 dark:text-[#94A3B8]">
                          {interview.userId?.email || 'Unknown user'}
                        </p>
                        <p className="text-xs text-dark-500 dark:text-[#94A3B8] mt-1">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {interview.overallScore && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-dark-900 dark:text-[#F8F9FA]">
                            {interview.overallScore}%
                          </div>
                          <div className="text-xs text-dark-500 dark:text-[#94A3B8]">Score</div>
                        </div>
                      )}
                      <Badge 
                        variant={interview.status === 'completed' ? 'success' : 'warning'}
                        className="capitalize"
                      >
                        {interview.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
