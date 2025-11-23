import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { jobApi } from '../../services/candidateApi';

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock
  },
  accepted: { 
    label: 'Accepted', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle
  }
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await jobApi.getApplications();
      if (response.data?.success && response.data?.applications) {
        setApplications(response.data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
          Applications
        </h1>
        <p className="text-dark-600 dark:text-dark-400">
          Track your job applications and their status
        </p>
      </motion.div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-dark-400 dark:text-dark-500" />
          <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
            No applications yet
          </h2>
          <p className="text-dark-600 dark:text-dark-400 mb-6">
            Your job applications will appear here once you start applying.
          </p>
          <Link to="/dashboard/jobs" className="inline-block">
            <Button className="group">
              Browse Jobs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const statusInfo = statusConfig[application.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
                          {application.jobTitle || application.job?.title || 'Job Title'}
                        </h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600 dark:text-dark-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.company || application.job?.company || 'Company'}
                        </span>
                        {application.location && (
                          <span>{application.location}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Applied on {formatDate(application.appliedAt)}
                        </span>
                      </div>

                      {application.job?.description && (
                        <p className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2 mb-4">
                          {application.job.description.substring(0, 150)}...
                        </p>
                      )}

                      {application.job?.skillsRequired && application.job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {application.job.skillsRequired.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded-full bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.job.skillsRequired.length > 5 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300">
                              +{application.job.skillsRequired.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {application.job?._id && (
                        <Link to={`/dashboard/jobs/${application.job._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
