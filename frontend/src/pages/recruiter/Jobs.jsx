import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, MapPin, Tag } from 'lucide-react';
import { recruiterApi } from '../../services/recruiterApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    level: 'mid',
    location: 'Remote'
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await recruiterApi.getJobs();
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await recruiterApi.createJob({
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(s => s.trim())
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        skillsRequired: '',
        level: 'mid',
        location: 'Remote'
      });
      loadJobs();
    } catch (err) {
      console.error('Failed to create job:', err);
      alert('Failed to create job');
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
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2">
              My{' '}
              <span className="gradient-text">Jobs</span>
            </h1>
            <p className="text-dark-600 dark:text-dark-400 text-lg">
              Manage your job postings
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="group">
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Create Job
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              variants={containerVariants}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full p-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                  {job.title}
                </h3>
                <p className="text-dark-600 dark:text-dark-400 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skillsRequired?.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                  {job.skillsRequired?.length > 3 && (
                    <Badge variant="default">
                      +{job.skillsRequired.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-dark-200 dark:border-dark-700">
                  <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <Badge variant="default">{job.level}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Job Posting"
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                rows={4}
                required
              />
            </div>
            <Input
              label="Skills (comma-separated)"
              value={formData.skillsRequired}
              onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
              placeholder="JavaScript, React, Node.js"
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Create</Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
