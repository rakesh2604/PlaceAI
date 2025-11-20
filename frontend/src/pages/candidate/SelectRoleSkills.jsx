import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Target } from 'lucide-react';
import { userApi, jobApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function SelectRoleSkills() {
  const location = useLocation();
  const jobId = location.state?.jobId;
  const [job, setJob] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const response = await jobApi.getJob(jobId);
      setJob(response.data.job);
      setSelectedSkills(response.data.job.skillsRequired || []);
    } catch (err) {
      console.error('Failed to load job:', err);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (selectedSkills.length === 0) return;
    if (!jobId) {
      alert('No job selected. Please go back and select a job.');
      navigate('/jobs');
      return;
    }

    setLoading(true);
    try {
      await userApi.updateRoleSkills(jobId, selectedSkills);
      updateUser({ selectedRoleId: jobId, selectedSkills });
      navigate('/interview/intro', { state: { jobId } });
    } catch (err) {
      console.error('Failed to save selection:', err);
      alert(err.response?.data?.message || 'Failed to save selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-3">
            Select Your{' '}
            <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Choose at least 3 skills relevant to{' '}
            <span className="font-semibold text-dark-900 dark:text-dark-100">{job.title}</span>
          </p>
        </motion.div>

        <Card className="p-8 md:p-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              Available Skills
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.skillsRequired?.map((skill, index) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <motion.button
                    key={skill}
                    variants={skillVariants}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-5 py-3 rounded-xl border-2 font-medium transition-all duration-300
                      ${isSelected
                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30'
                        : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 border-dark-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600'
                      }
                    `}
                  >
                    {skill}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between pt-6 border-t border-dark-200 dark:border-dark-700"
          >
            <div className="flex items-center gap-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${selectedSkills.length >= 3
                  ? 'bg-green-500 text-white'
                  : 'bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
                }
              `}>
                {selectedSkills.length}
              </div>
              <span className="text-sm text-dark-600 dark:text-dark-400">
                {selectedSkills.length >= 3 ? 'Ready!' : 'Select at least 3 skills'}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedSkills.length < 3}
              loading={loading}
              className="group"
            >
              Continue to Interview
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </Card>
      </div>
    </div>
  );
}
