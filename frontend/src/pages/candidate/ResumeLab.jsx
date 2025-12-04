import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, TrendingUp, AlertCircle, CheckCircle2, Sparkles, Loader2, 
  Upload, Download, Lightbulb, XCircle, Target, Award, MessageSquare, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import AnimatedCard from '../../components/ui/AnimatedCard';
import LimitReachedModal from '../../components/LimitReachedModal';
import ProfileCompletionModal from '../../components/ui/ProfileCompletionModal';
import PlacedAIVideo from '../../components/PlacedAIVideo';
import api from '../../services/api';

const CircularGauge = ({ score, size = 140 }) => {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-dark-200 dark:text-[#003566]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-xs text-dark-600 dark:text-[#CBD5E1] mt-1">ATS Score</div>
        </div>
      </div>
    </div>
  );
};

export default function ResumeLab() {
  const { user } = useAuthStore();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitModal, setLimitModal] = useState({ open: false, feature: '', limit: 0, used: 0 });
  const [pastReports, setPastReports] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load past reports
  useEffect(() => {
    loadPastReports();
  }, []);

  const loadPastReports = async () => {
    try {
      const response = await api.get('/ats/reports');
      if (response.data?.reports) {
        setPastReports(response.data.reports);
      }
    } catch (error) {
      // Silently handle error - past reports are optional
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile && !user?.resumeUrl) {
      setError('Please upload a resume PDF first.');
      return;
    }
    
    const { isProfileComplete } = await import('../../utils/profileUtils');
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      const response = await api.post('/ats/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success && response.data?.report) {
        setReport(response.data.report);
        await loadPastReports();
      } else {
        setError('Failed to analyze resume. Please try again.');
      }
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.code === 'LIMIT_REACHED') {
        const limitData = err.response.data;
        setLimitModal({
          open: true,
          feature: 'ATS checks',
          limit: limitData.limit,
          used: limitData.used
        });
      } else {
        setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWithAI = () => {
    // Navigate to resume builder with suggestions
    window.location.href = '/dashboard/resume-builder';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-[#F8F9FA]">
                ATS Resume Lab
              </h1>
              <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mt-1">
                Upload your resume PDF for ATS scoring, keyword analysis, and optimization recommendations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <PlacedAIVideo />
        </motion.div>

        {/* Past Reports */}
        {pastReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="p-4 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <h3 className="text-sm font-semibold text-dark-900 dark:text-[#F8F9FA] mb-3">Recent Reports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pastReports.slice(0, 3).map(report => (
                  <button
                    key={report._id}
                    onClick={() => setReport(report)}
                    className="p-3 rounded-lg border border-dark-200 dark:border-[#003566] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{report.score}%</span>
                      <span className="text-xs text-dark-600 dark:text-[#CBD5E1]">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-dark-600 dark:text-[#CBD5E1]">Click to view details</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {!report && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                    Upload Resume PDF
                  </h2>
                </div>
                <FileUpload
                  label="Choose PDF File"
                  accept=".pdf"
                  onChange={(file) => {
                    if (file) {
                      setResumeFile(file);
                      setError(null);
                    } else {
                      setResumeFile(null);
                    }
                  }}
                  error={error}
                />
                {resumeFile && (
                  <div className="mt-4 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-sm text-dark-700 dark:text-[#CBD5E1]">{resumeFile.name}</span>
                      </div>
                      <button
                        onClick={() => setResumeFile(null)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-dark-500 dark:text-[#94A3B8] mt-4">
                  Or analyze your uploaded resume from profile
                </p>
              </div>
            </motion.div>

            {/* Job Description Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA]">
                    Job Description (Optional)
                  </h2>
                </div>
                <p className="text-sm text-dark-600 dark:text-[#CBD5E1] mb-4">
                  Paste the job description to get keyword-specific analysis
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  className="w-full h-48 px-4 py-3 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA] placeholder:text-dark-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Analyze Button */}
        {!report && (
          <div className="mb-8 flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={loading || (!resumeFile && !user?.resumeUrl)}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        )}

        {/* ATS Report Results */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Score Card */}
            <div className="p-8 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0">
                  <CircularGauge score={report.score || 0} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-4">
                    ATS Compatibility Score
                  </h2>
                  <p className="text-base text-dark-600 dark:text-[#CBD5E1] mb-6">
                    {report.score >= 80
                      ? 'Excellent! Your resume is highly ATS-compatible. Most ATS systems will parse it correctly.'
                      : report.score >= 60
                      ? 'Good! Your resume is mostly ATS-compatible, but there\'s room for improvement.'
                      : 'Your resume needs optimization for ATS systems. Follow the recommendations below to improve your score.'}
                  </p>

                  {/* Score Breakdown */}
                  {report.breakdown && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {report.breakdown.keywords && (
                        <div className="p-4 rounded-lg bg-dark-50 dark:bg-[#003566] text-center">
                          <div className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                            {report.breakdown.keywords.score}%
                          </div>
                          <div className="text-xs text-dark-600 dark:text-[#CBD5E1]">Keywords</div>
                        </div>
                      )}
                      {report.breakdown.formatting && (
                        <div className="p-4 rounded-lg bg-dark-50 dark:bg-[#003566] text-center">
                          <div className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                            {report.breakdown.formatting.score}%
                          </div>
                          <div className="text-xs text-dark-600 dark:text-[#CBD5E1]">Formatting</div>
                        </div>
                      )}
                      {report.breakdown.content && (
                        <div className="p-4 rounded-lg bg-dark-50 dark:bg-[#003566] text-center">
                          <div className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                            {report.breakdown.content.score}%
                          </div>
                          <div className="text-xs text-dark-600 dark:text-[#CBD5E1]">Content</div>
                        </div>
                      )}
                      {report.breakdown.structure && (
                        <div className="p-4 rounded-lg bg-dark-50 dark:bg-[#003566] text-center">
                          <div className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                            {report.breakdown.structure.score}%
                          </div>
                          <div className="text-xs text-dark-600 dark:text-[#CBD5E1]">Structure</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3 justify-center md:justify-start">
                    <Button onClick={handleImproveWithAI} size="sm" className="group">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Improve with AI
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setReport(null)} 
                      size="sm"
                    >
                      New Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {report.strengths && report.strengths.length > 0 && (
                <div className="p-6 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA]">
                      Strengths
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {report.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-dark-700 dark:text-[#CBD5E1]">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {report.weaknesses && report.weaknesses.length > 0 && (
                <div className="p-6 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA]">
                      Areas to Improve
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {report.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-dark-700 dark:text-[#CBD5E1]">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Keywords Analysis */}
            {report.keywordsAnalysis && (
              <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA]">
                    Keywords Analysis
                  </h3>
                </div>
                
                {report.keywordsAnalysis.found && report.keywordsAnalysis.found.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-3">Found Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.keywordsAnalysis.found.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.keywordsAnalysis.missing && report.keywordsAnalysis.missing.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-3">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.keywordsAnalysis.missing.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-dark-500 dark:text-[#94A3B8] mt-3">
                      Add these keywords naturally throughout your resume to improve ATS matching.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="p-6 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50 dark:bg-cyan-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA]">
                    Recommendations
                  </h3>
                </div>
                <div className="space-y-4">
                  {report.recommendations
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                    .map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white dark:bg-[#001D3D] border border-dark-200 dark:border-[#003566]">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          rec.type === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          rec.type === 'important' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark-900 dark:text-[#F8F9FA] mb-1">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-dark-600 dark:text-[#CBD5E1]">
                            {rec.description}
                          </p>
                          {rec.category && (
                            <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-dark-100 dark:bg-[#003566] text-dark-600 dark:text-[#CBD5E1]">
                              {rec.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
            {report.breakdown && (
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(report.breakdown).map(([key, data]) => (
                  data && (
                    <div key={key} className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-[#F8F9FA] mb-4 capitalize">
                        {key}
                      </h3>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-dark-600 dark:text-[#CBD5E1]">Score</span>
                          <span className="text-2xl font-bold text-dark-900 dark:text-[#F8F9FA]">{data.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-100 dark:bg-[#003566] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.score}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                      {data.suggestions && data.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Suggestions:</h4>
                          <ul className="space-y-1">
                            {data.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-xs text-dark-600 dark:text-[#CBD5E1] flex items-start gap-2">
                                <ChevronRight className="w-3 h-3 text-cyan-500 flex-shrink-0 mt-0.5" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <LimitReachedModal
        isOpen={limitModal.open}
        onClose={() => setLimitModal({ open: false, feature: '', limit: 0, used: 0 })}
        feature={limitModal.feature}
        limit={limitModal.limit}
        used={limitModal.used}
      />

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        requiredAction="resumeLab"
      />
    </div>
  );
}
