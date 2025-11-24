import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, TrendingUp, MessageSquare, Award, Target, ArrowRight, CheckCircle2, Download, FileText, RotateCcw } from 'lucide-react';
import { interviewApi } from '../../services/candidateApi';
import Button from '../../components/ui/Button';
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function InterviewResult() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInterview();
  }, [id]);

  const loadInterview = async () => {
    try {
      const response = await interviewApi.getInterview(id);
      const interviewData = response.data.interview;
      
      // If interview is completed but not evaluated, trigger evaluation
      if (interviewData.status === 'completed' && !interviewData.aiScores) {
        try {
          const evalResponse = await interviewApi.evaluate(id);
          setInterview(evalResponse.data.interview);
        } catch (evalErr) {
          console.error('Failed to evaluate interview:', evalErr);
          setInterview(interviewData);
        }
      } else {
        setInterview(interviewData);
      }
    } catch (err) {
      console.error('Failed to load interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await interviewApi.downloadPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
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

  if (!interview || !interview.aiScores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-dark-600 dark:text-dark-400 mb-4">Interview results not available yet.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const scores = interview.aiScores || {};
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-primary-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const getScorePercentage = (score) => {
    return Math.round(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-glow-lg"
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-4">
              Interview{' '}
              <span className="gradient-text">Results</span>
            </h1>
            <p className="text-dark-600 dark:text-dark-400 text-lg">
              Your performance has been evaluated by our AI system
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-8 text-center">
              <div className="mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className={`text-7xl font-bold mb-2 ${getScoreColor(scores.overall || 0)}`}
                >
                  {getScorePercentage(scores.overall || 0)}/100
                </motion.div>
                <Badge variant={getScoreVariant(scores.overall || 0)}>
                  {(scores.overall || 0) >= 80 ? 'Excellent' : (scores.overall || 0) >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Total Questions: {interview.questions?.length || 0}
              </p>
            </Card>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary-500" />
                Score Breakdown
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Communication', score: scores.communication || 0, icon: MessageSquare },
                  { label: 'Confidence', score: scores.confidence || 0, icon: TrendingUp },
                  { label: 'Technical', score: scores.technical || 0, icon: Star },
                  { label: 'Fluency', score: scores.fluency || 0, icon: MessageSquare },
                  { label: 'Vocabulary', score: scores.vocabularyStrength || 0, icon: Star },
                  { label: 'Domain Knowledge', score: scores.domainKnowledge || 0, icon: Target },
                  { label: 'Grammar', score: scores.grammarAccuracy || 0, icon: CheckCircle2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary-500" />
                          <span className="font-medium text-dark-900 dark:text-dark-100">
                            {item.label}
                          </span>
                        </div>
                        <span className={`font-bold ${getScoreColor(item.score)}`}>
                          {getScorePercentage(item.score)}/100
                        </span>
                      </div>
                      <div className="w-full h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getScorePercentage(item.score)}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className={`h-full rounded-full ${
                            item.score >= 80
                              ? 'bg-green-500'
                              : item.score >= 60
                              ? 'bg-primary-500'
                              : item.score >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {scores.strengths && scores.strengths.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="p-6 h-full">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {scores.strengths.map((strength, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-dark-700 dark:text-dark-300">{strength}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {scores.improvements && scores.improvements.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="p-6 h-full">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {scores.improvements.map((improvement, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-yellow-500 flex-shrink-0 mt-0.5">→</span>
                        <span className="text-dark-700 dark:text-dark-300">{improvement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          {scores.summary && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-6 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  Summary
                </h3>
                <p className="text-dark-700 dark:text-dark-300 leading-relaxed">
                  {scores.summary}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Detailed Feedback */}
          {scores.detailedFeedback && Object.keys(scores.detailedFeedback).length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-500" />
                  Detailed Feedback
                </h3>
                <div className="space-y-4">
                  {Object.entries(scores.detailedFeedback).map(([key, feedback]) => (
                    <div key={key} className="p-4 rounded-lg bg-dark-50 dark:bg-dark-900">
                      <h4 className="font-semibold text-dark-900 dark:text-dark-100 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-dark-700 dark:text-dark-300 text-sm">
                        {feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Transcripts */}
          {interview.answers && interview.answers.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-500" />
                  Interview Transcripts
                </h3>
                <div className="space-y-6">
                  {interview.answers.map((answer, idx) => {
                    const question = interview.questions?.find(q => q.id === answer.questionId);
                    return (
                      <div key={idx} className="p-4 rounded-lg bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                            Question {idx + 1}
                          </span>
                          {answer.timeTaken && (
                            <span className="ml-2 text-xs text-dark-500 dark:text-dark-400">
                              ({answer.timeTaken}s)
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-dark-900 dark:text-dark-100 mb-2">
                          {question?.text || 'Question not found'}
                        </p>
                        <p className="text-dark-700 dark:text-dark-300">
                          {answer.transcript || answer.answerText || 'No transcript available'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Additional Stats */}
          {scores.fillerWordsCount !== undefined && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">
                      {scores.fillerWordsCount || 0}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Filler Words</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">
                      {getScorePercentage(scores.multiLanguageCoherence || 0)}%
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Language Coherence</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/interview/intro')}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Interview
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="group"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
