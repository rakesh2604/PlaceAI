import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, Ban, CheckCircle2, XCircle, Crown } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function AdminUsers() {
  const { logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const params = filter !== 'all' ? { role: filter } : {};
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await adminApi.blockUser(userId, isBlocked);
      loadUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to update user status');
    }
  };

  const handleUpgradePlan = async (userId, planId) => {
    try {
      await adminApi.approvePremium(userId, planId !== 'free');
      // Also update planId if needed
      loadUsers();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to update plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
              User Management
            </h1>
            <p className="text-dark-600 dark:text-dark-400">
              Manage all users, plans, and access
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'candidate', 'recruiter', 'admin'].map((role) => (
            <Button
              key={role}
              variant={filter === role ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-dark-900 dark:text-dark-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-dark-400" />
                        <span className="text-dark-900 dark:text-dark-100">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="default">{user.role}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${user.planId === 'premium' ? 'text-yellow-500' : user.planId === 'enterprise' ? 'text-purple-500' : 'text-dark-400'}`} />
                        <span className="text-dark-700 dark:text-dark-300 capitalize">{user.planId || 'free'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">
                      {user.usage ? (
                        <div className="space-y-1">
                          <div>Interviews: {user.usage.aiInterviewsThisMonth || 0}</div>
                          <div>ATS: {user.usage.atsChecksThisMonth || 0}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.isBlocked ? (
                        <Badge variant="danger">Blocked</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Block
                            </>
                          )}
                        </Button>
                        {user.planId !== 'premium' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpgradePlan(user._id, 'premium')}
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Premium
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

