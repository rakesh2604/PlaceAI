import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, Crown, BarChart3 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminATSScores() {
  const [atsScores, setAtsScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadATSScores();
  }, []);

  const loadATSScores = async () => {
    try {
      const response = await adminApi.getATSScores();
      setAtsScores(response.data.atsScores || []);
    } catch (error) {
      console.error('Error loading ATS scores:', error);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            ATS Resume Scores
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            View ATS score analytics for all users
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-cyan-500" />
              <div>
                <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
                  Summary
                </h2>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  {atsScores.length} users with resumes uploaded
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Has Resume</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Skills</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Experience</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">ATS Checks Used</th>
                </tr>
              </thead>
              <tbody>
                {atsScores.map((score) => (
                  <tr key={score.userId} className="border-b border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-dark-400" />
                        <span className="text-dark-900 dark:text-dark-100">{score.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${score.planId === 'premium' ? 'text-yellow-500' : 'text-dark-400'}`} />
                        <span className="text-dark-700 dark:text-dark-300 capitalize">{score.planId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {score.hasResume ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <Badge variant="default">No</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {score.skills?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                            {skill}
                          </span>
                        ))}
                        {score.skills?.length > 3 && (
                          <span className="text-xs text-dark-500">+{score.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">
                      {score.experienceYears || 0} years
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-dark-900 dark:text-dark-100">
                        {score.atsChecksUsed || 0}
                      </span>
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

