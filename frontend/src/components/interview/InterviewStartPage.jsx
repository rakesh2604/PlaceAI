import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, Languages, Play } from 'lucide-react';
import Button from '../ui/Button';
import { SpeechRecognitionService, SUPPORTED_LANGUAGES } from '../../utils/speechUtils';

export default function InterviewStartPage({ interview, onStart }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      // Request camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      // Setup camera preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }

      // Setup microphone and language detection
      setupLanguageDetection(stream);
      setMicReady(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const setupLanguageDetection = (stream) => {
    try {
      const recognition = new SpeechRecognitionService();
      recognitionRef.current = recognition;

      recognition.onTranscript = ({ final }) => {
        if (final.trim()) {
          const detected = recognition.detectLanguageFromText(final);
          if (detected) {
            const langCode = detected.split('-')[0];
            setDetectedLanguage(langCode);
          }
        }
      };

      recognition.onLanguageDetected = (lang) => {
        const langCode = lang.split('-')[0];
        setDetectedLanguage(langCode);
      };

      recognition.onError = (error) => {
        console.error('Speech recognition error:', error);
      };

      // Start listening for language detection
      setIsDetecting(true);
      recognition.start('en-US');
    } catch (error) {
      console.error('Speech recognition not available:', error);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleStart = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onStart(detectedLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Camera Preview */}
          <div className="space-y-4">
            <div className="relative bg-dark-900 rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-2 text-dark-400" />
                    <p className="text-dark-400">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                cameraReady ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">Camera {cameraReady ? 'Ready' : 'Initializing'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                micReady ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {micReady ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="text-sm font-medium">Mic {micReady ? 'Ready' : 'Initializing'}</span>
              </div>
            </div>
          </div>

          {/* Instructions and Language Detection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                Get Ready for Your Interview
              </h2>
              <p className="text-dark-600 dark:text-dark-400">
                We'll ask you questions one at a time. Please answer using your voice.
              </p>
            </div>

            {/* Language Detection */}
            <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="font-semibold text-dark-900 dark:text-dark-100">Detected Language</span>
              </div>
              {isDetecting ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-cyan-500"
                  />
                  <p className="text-sm text-dark-700 dark:text-dark-300">
                    Listening for language detection... Please speak a few words.
                  </p>
                </div>
              ) : (
                <p className="text-lg font-medium text-cyan-700 dark:text-cyan-300">
                  {SUPPORTED_LANGUAGES[detectedLanguage]?.nativeName || SUPPORTED_LANGUAGES[detectedLanguage]?.name || 'English'}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-dark-900 dark:text-dark-100">Instructions:</h3>
              <ul className="space-y-2 text-sm text-dark-600 dark:text-dark-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Speak your answers clearly into the microphone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Each question has a time limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>You cannot type answers - voice only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Find a quiet, well-lit environment</span>
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              disabled={!cameraReady || !micReady}
              className="w-full"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interview
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

