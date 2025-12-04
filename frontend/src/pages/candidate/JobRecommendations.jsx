import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, TrendingUp, ArrowRight, Filter, Search, 
  IndianRupee, Clock, Building2, Star, Sparkles, X 
} from 'lucide-react';
import { jobApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AnimatedCard from '../../components/ui/AnimatedCard';
import Badge from '../../components/ui/Badge';
import ProfileCompletionModal from '../../components/ui/ProfileCompletionModal';
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function JobRecommendations() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    ctc: '',
    experience: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [jobs, filters, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobApi.getRecommendations();
      
      // Check for 401 Unauthorized
      if (response?.status === 401) {
        console.error('Authentication failed. Token may be invalid or expired.');
        // The API interceptor should handle redirect, but if not, redirect here
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        // Token exists but invalid - clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Check for other error statuses
      if (response?.status >= 400) {
        console.error('API Error:', response?.status, response?.data);
        setJobs([]);
        setFilteredJobs([]);
        return;
      }
      
      // Handle different response formats - Axios wraps response in .data
      let jobsData = [];
      if (response?.data?.jobs && Array.isArray(response.data.jobs)) {
        jobsData = response.data.jobs;
      } else if (Array.isArray(response?.data)) {
        jobsData = response.data;
      } else if (Array.isArray(response?.jobs)) {
        jobsData = response.jobs;
      }
      
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (err) {
      console.error('Error loading jobs:', err);
      if (err.response?.status === 401) {
        // Handle 401 in catch block too
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Ensure jobs is always an array
    const jobsArray = Array.isArray(jobs) ? jobs : [];
    let filtered = [...jobsArray];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        (job.title || '').toLowerCase().includes(query) ||
        (job.description || '').toLowerCase().includes(query) ||
        (job.company || '').toLowerCase().includes(query) ||
        (job.skillsRequired || []).some(skill => (skill || '').toLowerCase().includes(query))
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(job =>
        (job.title || '').toLowerCase().includes(filters.role.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        (job.location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // CTC filter
    if (filters.ctc) {
      const ctcValue = parseInt(filters.ctc);
      filtered = filtered.filter(job => {
        const jobCtc = parseInt(job.ctc || 0);
        return jobCtc >= ctcValue;
      });
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter(job =>
        job.experienceLevel === filters.experience ||
        (job.minExperience && job.minExperience <= parseInt(filters.experience))
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(job =>
        job.type === filters.type
      );
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      location: '',
      ctc: '',
      experience: '',
      type: ''
    });
    setSearchQuery('');
  };

  const handleApply = async (jobId) => {
    // Check profile completion before allowing job application
    const { isProfileComplete } = await import('../../utils/profileUtils');
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
      return;
    }

    try {
      const response = await jobApi.apply(jobId);
      
      if (response.data?.success) {
        alert('Application submitted successfully!');
        await loadJobs();
      } else {
        alert(response.data?.message || 'Failed to apply. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    }
  };

  const handleSelectJob = (jobId) => {
    // Select job for interview practice
    navigate('/select-role', { state: { jobId } });
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

  // Get unique values for filters - ensure jobs is an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  const uniqueRoles = [...new Set(jobsArray.map(job => job.title).filter(Boolean))];
  const uniqueLocations = [...new Set(jobsArray.map(job => job.location).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-[#F8F9FA]">
                Job Opportunities
              </h1>
              <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mt-1">
                Find jobs matching your profile and apply directly
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-[#94A3B8]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, skills..."
                className="pl-12"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="group"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              {(filters.role || filters.location || filters.ctc || filters.experience || filters.type) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <div className="flex-1 text-right">
                <span className="text-sm text-dark-600 dark:text-[#CBD5E1]">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">
                      Role
                    </label>
                    <Select
                      value={filters.role}
                      onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                      <option value="">All Roles</option>
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">
                      Location
                    </label>
                    <Select
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </Select>
                  </div>

                  {/* CTC Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">
                      Min CTC (LPA)
                    </label>
                    <Input
                      type="number"
                      value={filters.ctc}
                      onChange={(e) => setFilters({ ...filters, ctc: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">
                      Experience
                    </label>
                    <Select
                      value={filters.experience}
                      onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    >
                      <option value="">All Levels</option>
                      <option value="0">Fresher</option>
                      <option value="1">1-2 years</option>
                      <option value="3">3-5 years</option>
                      <option value="5">5+ years</option>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">
                      Job Type
                    </label>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Jobs Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job._id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  {job.matchScore && (
                    <Badge variant="primary" className="bg-green-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {job.matchScore}% Match
                    </Badge>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 mb-4">
                  <h3 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                    {job.title}
                  </h3>
                  {job.company && (
                    <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-[#CBD5E1] mb-3">
                      <Building2 className="w-4 h-4" />
                      {job.company}
                    </div>
                  )}
                  <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Skills */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skillsRequired.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="px-2 py-1 text-xs rounded-lg bg-dark-100 dark:bg-[#003566] text-dark-600 dark:text-[#CBD5E1]">
                          +{job.skillsRequired.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="space-y-2 text-sm text-dark-600 dark:text-[#CBD5E1]">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                    )}
                    {job.ctc && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        {job.ctc} LPA
                      </div>
                    )}
                    {job.type && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-[#003566]">
                  <Button
                    size="sm"
                    onClick={() => handleSelectJob(job._id)}
                    variant="outline"
                    className="flex-1 group"
                  >
                    Practice Interview
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApply(job._id)}
                    className="flex-1 group"
                  >
                    Apply
                    <Sparkles className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase className="w-16 h-16 text-dark-400 dark:text-[#94A3B8] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">
              No Jobs Found
            </h3>
            <p className="text-dark-600 dark:text-[#CBD5E1] mb-6">
              Try adjusting your filters or search query.
            </p>
            {(filters.role || filters.location || filters.ctc || filters.experience || filters.type || searchQuery) && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        requiredAction="jobs"
      />
    </div>
  );
}
