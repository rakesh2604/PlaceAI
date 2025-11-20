import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StopCircle, Pause, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterviewAvatar from './InterviewAvatar';
import InterviewQuestionBox from './InterviewQuestionBox';
import InterviewTimer from './InterviewTimer';
import InterviewTranscriptStream from './InterviewTranscriptStream';
import Button from '../ui/Button';
import { SpeechRecognitionService, TextToSpeechService, getLanguageCode } from '../../utils/speechUtils';
import api from '../../services/api';

export default function InterviewSession({ interview, language }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionSpoken, setQuestionSpoken] = useState(false);
  
  const recognitionRef = useRef(null);
  const ttsRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const navigate = useNavigate();

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= interview.questions.length - 1;

  useEffect(() => {
    if (currentQuestion) {
      initializeQuestion();
    }
    return () => {
      cleanup();
    };
  }, [currentQuestionIndex]);

  const initializeQuestion = () => {
    // Reset state
    setTranscript('');
    setFinalTranscript('');
    setQuestionSpoken(false);
    setTimeRemaining(currentQuestion.timeLimit || 60);
    setIsRecording(false);
    setIsPaused(false);

    // Stop any ongoing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Speak the question
    speakQuestion();
  };

  const speakQuestion = () => {
    if (!ttsRef.current) {
      ttsRef.current = new TextToSpeechService();
    }

    const questionText = `Question ${currentQuestionIndex + 1}. ${currentQuestion.text}`;
    const langCode = getLanguageCode(language || 'en');
    
    ttsRef.current.speak(questionText, langCode, () => {
      setQuestionSpoken(true);
      startRecording();
    });
  };

  const startRecording = () => {
    try {
      const recognition = new SpeechRecognitionService();
      recognitionRef.current = recognition;
      const langCode = getLanguageCode(language || 'en');

      recognition.onTranscript = ({ interim, final, full }) => {
        setTranscript(interim);
        setFinalTranscript(final);
      };

      recognition.onError = (error) => {
        console.error('Speech recognition error:', error);
        if (error === 'no-speech') {
          // Auto-restart if no speech detected
          setTimeout(() => {
            if (recognitionRef.current && !isPaused) {
              recognitionRef.current.start(langCode);
            }
          }, 1000);
        }
      };

      startTimeRef.current = Date.now();
      recognition.start(langCode);
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      alert('Speech recognition not available. Please use a modern browser.');
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
  };

  const handleTimeUp = async () => {
    stopRecording();
    await saveAnswer();
    moveToNextQuestion();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handlePause = () => {
    if (isPaused) {
      // Resume
      if (recognitionRef.current) {
        const langCode = getLanguageCode(language || 'en');
        recognitionRef.current.start(langCode);
      }
      setIsPaused(false);
      startTimer();
    } else {
      // Pause
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsPaused(true);
    }
  };

  const handleRepeatQuestion = () => {
    if (ttsRef.current) {
      ttsRef.current.stop();
    }
    speakQuestion();
  };

  const saveAnswer = async () => {
    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    const answerText = finalTranscript || transcript;

    try {
      await api.post('/interview/save-answer', {
        interviewId: interview._id,
        questionId: currentQuestion.id,
        transcript: answerText,
        timeTaken,
        language: language || 'en'
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const moveToNextQuestion = async () => {
    stopRecording();

    if (isLastQuestion) {
      // Finish interview
      await finishInterview();
    } else {
      // Move to next question
      try {
        const response = await api.post('/interview/next-question', {
          interviewId: interview._id
        });

        if (response.data.isComplete) {
          await finishInterview();
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to move to next question:', error);
      }
    }
  };

  const finishInterview = async () => {
    stopRecording();
    navigate(`/interview/result/${interview._id}`);
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (ttsRef.current) {
      ttsRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">
            Question {currentQuestionIndex + 1} of {interview.questions.length}
          </h2>
          <div className="w-full max-w-md mx-auto h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Avatar */}
          <div className="lg:col-span-1">
            <InterviewAvatar
              isSpeaking={!questionSpoken}
              language={language}
            />
          </div>

          {/* Center: Question */}
          <div className="lg:col-span-2 space-y-6">
            <InterviewQuestionBox
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
            />

            {/* Transcript */}
            <InterviewTranscriptStream
              transcript={transcript}
              finalTranscript={finalTranscript}
              isRecording={isRecording}
            />

            {/* Timer and Controls */}
            <div className="space-y-4">
              <InterviewTimer
                timeRemaining={timeRemaining}
                totalTime={currentQuestion.timeLimit || 60}
              />

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRepeatQuestion}
                  disabled={!questionSpoken}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repeat Question
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  disabled={!isRecording}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="danger"
                  onClick={moveToNextQuestion}
                  disabled={!isRecording && !isPaused}
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

