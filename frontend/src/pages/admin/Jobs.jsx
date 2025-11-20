import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Edit2, Trash2, Eye, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data?.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.delete(`/jobs/${jobId}`);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000814]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.level === filter || job.type === filter);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                Job Management
              </h1>
              <p className="text-dark-600 dark:text-[#CBD5E1]">
                Manage all job listings and applications
              </p>
            </div>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'junior', 'mid', 'senior', 'lead'].map((level) => (
            <Button
              key={level}
              variant={filter === level ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-2">
                      {job.company}
                    </p>
                  )}
                </div>
                <Badge variant="default" className="capitalize">
                  {job.level || 'mid'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-[#CBD5E1]">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                )}
                {job.ctc && (
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-[#CBD5E1]">
                    <DollarSign className="w-4 h-4" />
                    ₹{job.ctc.toLocaleString()} LPA
                  </div>
                )}
                {job.applications && job.applications.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-[#CBD5E1]">
                    <Users className="w-4 h-4" />
                    {job.applications.length} applications
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-[#CBD5E1]">
                  <Clock className="w-4 h-4" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skillsRequired.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired.length > 3 && (
                    <span className="px-2 py-1 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 text-xs">
                      +{job.skillsRequired.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-[#003566]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`/jobs/${job._id}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteJob(job._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-dark-400 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
              No jobs found
            </h3>
            <p className="text-dark-600 dark:text-[#CBD5E1]">
              {filter === 'all' ? 'Create your first job listing' : 'No jobs match this filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

