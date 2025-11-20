import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Calendar } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { Link } from 'react-router-dom';

export default function AdminInterviews() {
  const { logout } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInterviews();
  }, [filter]);

  const loadInterviews = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminApi.getInterviews(params);
      setInterviews(response.data.interviews || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      interview.userId?.email?.toLowerCase().includes(searchLower) ||
      interview.jobId?.title?.toLowerCase().includes(searchLower) ||
      interview.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

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
                <Link to="/admin/interviews" className="text-primary-600 dark:text-primary-400 font-medium">Interviews</Link>
                <Link to="/admin/payments" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Payments</Link>
                <Link to="/admin/ats-scores" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">ATS Scores</Link>
                <Link to="/admin/usage" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Usage</Link>
                <Link to="/admin/support" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Support</Link>
                <Link to="/admin/settings" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Settings</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            All Interviews
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            View and manage all interview sessions
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by email, job title, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Job</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-700 dark:text-dark-300">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-dark-500 dark:text-dark-400">
                      No interviews found
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((interview) => (
                    <motion.tr
                      key={interview._id}
                      whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
                      className="border-b border-dark-100 dark:border-dark-800"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-dark-900 dark:text-dark-100">
                          {interview.userId?.email || 'Unknown'}
                        </p>
                        {interview.userId?.phone && (
                          <p className="text-xs text-dark-500 dark:text-dark-500">
                            {interview.userId.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-dark-700 dark:text-dark-300">
                          {interview.jobId?.title || 'N/A'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            interview.status === 'completed' ? 'success' :
                            interview.status === 'in-progress' ? 'warning' : 'default'
                          }
                        >
                          {interview.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-600 dark:text-dark-400">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {interview.score ? (
                          <span className="font-semibold text-dark-900 dark:text-dark-100">
                            {interview.score.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-dark-400">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

