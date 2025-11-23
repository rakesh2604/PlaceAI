import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PhoneInputIntl from '../../components/ui/PhoneInputIntl';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../services/candidateApi';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await userApi.updateProfile({
        name: formData.name,
        phone: formData.phone
      });

      if (response.data?.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.data?.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
          Settings
        </h1>
        <p className="text-dark-600 dark:text-dark-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
              Profile Information
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email"
              value={formData.email}
              disabled
              placeholder="Email cannot be changed"
              className="opacity-60 cursor-not-allowed"
            />
            <PhoneInputIntl
              label="Phone Number"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value || '' })}
              defaultCountry="IN"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-500"
              >
                Profile updated successfully!
              </motion.p>
            )}
            <Button type="submit" loading={loading} className="group">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
              Notifications
            </h2>
          </div>
          <p className="text-sm text-dark-600 dark:text-dark-400">
            Notification preferences coming soon
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
              Security
            </h2>
          </div>
          <p className="text-sm text-dark-600 dark:text-dark-400">
            Security settings coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}
