import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { optInApi } from '../../services/candidateApi';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

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

export default function DashboardOptIns() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await optInApi.getRequests();
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, status) => {
    try {
      await optInApi.submit(requestId, status, note);
      setSelectedRequest(null);
      setNote('');
      loadRequests();
    } catch (err) {
      console.error('Failed to submit response:', err);
      alert('Failed to submit response. Please try again.');
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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-4">
            Job{' '}
            <span className="gradient-text">Opportunities</span>
          </h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Review and respond to recruiter connection requests
          </p>
        </motion.div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-dark-600 dark:text-dark-400 text-lg">
                No opt-in requests yet
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {requests.map((request) => (
              <motion.div
                key={request._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100">
                              {request.jobId?.title}
                            </h3>
                            <Badge
                              variant={
                                request.status === 'ACCEPTED'
                                  ? 'success'
                                  : request.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {request.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                              {request.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {request.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-dark-600 dark:text-dark-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {request.recruiterId?.companyName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {request.message && (
                            <p className="text-dark-700 dark:text-dark-300 bg-dark-50 dark:bg-dark-800 rounded-lg p-3">
                              {request.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Respond
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Respond to Request"
        >
          <div className="space-y-4">
            <p className="text-dark-700 dark:text-dark-300">
              <strong>{selectedRequest?.recruiterId?.companyName}</strong> is interested in
              connecting with you about <strong>{selectedRequest?.jobId?.title}</strong>.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional message..."
              className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => handleResponse(selectedRequest._id, 'REJECTED')}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={() => handleResponse(selectedRequest._id, 'ACCEPTED')}
                className="flex-1"
              >
                Accept
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
