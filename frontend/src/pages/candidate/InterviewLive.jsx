import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Mic, MicOff, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { interviewApi } from '../../services/candidateApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LimitReachedModal from '../../components/LimitReachedModal';

export default function InterviewLive() {
  const location = useLocation();
  const interview = location.state?.interview;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [limitModal, setLimitModal] = useState({ open: false, feature: '', limit: 0, used: 0 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!interview) {
      navigate('/interview/intro');
      return;
    }

    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordingBlob(blob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    const question = interview.questions[currentQuestionIndex];
    setAnswers([...answers, {
      questionId: question.id,
      answerText: currentAnswer
    }]);
    setCurrentAnswer('');

    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const question = interview.questions[currentQuestionIndex];
    const finalAnswers = [...answers, {
      questionId: question.id,
      answerText: currentAnswer
    }];

    try {
      if (recordingBlob) {
        const file = new File([recordingBlob], 'interview.webm', { type: 'video/webm' });
        await interviewApi.uploadRecording(interview._id, file);
      }

      const response = await interviewApi.finish(interview._id, finalAnswers);
      stopCamera();
      navigate(`/interview/result/${interview._id}`);
    } catch (err) {
      // Error handled via alert below
      
      // Check if it's a limit reached error
      if (err.response?.status === 429 && err.response?.data?.code === 'LIMIT_REACHED') {
        const limitData = err.response.data;
        setLimitModal({
          open: true,
          feature: 'AI interviews',
          limit: limitData.limit,
          used: limitData.used
        });
      } else {
        alert(err.response?.data?.message || 'Failed to submit interview. Please try again.');
      }
    }
  };

  if (!interview) return null;

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-600 dark:text-dark-400">
              Question {currentQuestionIndex + 1} of {interview.questions.length}
            </span>
            <span className="text-sm font-medium text-dark-600 dark:text-dark-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full gradient-primary rounded-full shadow-lg"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Side */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full p-8">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-4">
                  {currentQuestion.text}
                </h3>
              </div>
              
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-64 px-4 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 resize-none"
              />
            </Card>
          </motion.div>

          {/* Video Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="relative rounded-xl overflow-hidden bg-dark-900 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full"
                  />
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                    ${isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                    }
                  `}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setCurrentAnswer(answers[currentQuestionIndex - 1]?.answerText || '');
              }
            }}
            disabled={currentQuestionIndex === 0}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Previous
          </Button>
          <Button
            onClick={isLastQuestion ? handleFinish : handleNext}
            disabled={!currentAnswer.trim()}
            className="group min-w-[200px]"
          >
            {isLastQuestion ? (
              <>
                Finish Interview
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <LimitReachedModal
        isOpen={limitModal.open}
        onClose={() => setLimitModal({ open: false, feature: '', limit: 0, used: 0 })}
        feature={limitModal.feature}
        limit={limitModal.limit}
        used={limitModal.used}
      />
    </div>
  );
}
