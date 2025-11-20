import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Send } from 'lucide-react';
import { recruiterApi } from '../../services/recruiterApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RecruiterCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ jobId: '', message: '' });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadCandidates();
    loadJobs();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await recruiterApi.getCandidates();
      setCandidates(response.data.candidates || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await recruiterApi.getJobs();
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const handleSendRequest = async () => {
    try {
      await recruiterApi.sendOptInRequest(
        selectedCandidate._id,
        requestData.jobId,
        requestData.message
      );
      setShowRequestModal(false);
      setSelectedCandidate(null);
      setRequestData({ jobId: '', message: '' });
      alert('Opt-in request sent successfully!');
    } catch (err) {
      console.error('Failed to send request:', err);
      alert(err.response?.data?.message || 'Failed to send request');
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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-2">
            Browse{' '}
            <span className="gradient-text">Candidates</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Find and connect with talented candidates
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {candidates.map((candidate) => (
            <motion.div
              key={candidate._id}
              variants={containerVariants}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-2 text-center">
                  {candidate.email}
                </h3>
                {candidate.selectedRoleId && (
                  <p className="text-sm text-dark-600 dark:text-dark-400 mb-4 text-center">
                    Role: {candidate.selectedRoleId.title}
                  </p>
                )}
                {candidate.resumeParsed?.skills && (
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {candidate.resumeParsed.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowRequestModal(true);
                  }}
                  className="w-full group"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Send Opt-In Request
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Modal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedCandidate(null);
          }}
          title="Send Opt-In Request"
        >
          <div className="space-y-4">
            <select
              value={requestData.jobId}
              onChange={(e) => setRequestData({ ...requestData, jobId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
              required
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <textarea
              value={requestData.message}
              onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
              placeholder="Optional message to candidate..."
              className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSendRequest}
                disabled={!requestData.jobId}
                className="flex-1"
              >
                Send Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedCandidate(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
