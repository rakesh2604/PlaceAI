import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward } from 'lucide-react';
import Button from './Button';

const TUTORIAL_STORAGE_KEY = 'placedai_tutorial_completed';

export default function TutorialPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to PlacedAI!',
      description: 'Get ready to ace your campus placements with AI-powered interview practice.',
      video: '/tutorial-step1.mp4',
    },
    {
      title: 'Upload Your Resume',
      description: 'Upload your resume to get personalized job recommendations and interview questions.',
      video: '/tutorial-step2.mp4',
    },
    {
      title: 'Practice Interviews',
      description: 'Take AI-powered mock interviews and get instant feedback on your performance.',
      video: '/tutorial-step3.mp4',
    },
    {
      title: 'Get Matched with Recruiters',
      description: 'Connect with top companies based on your skills and interview performance.',
      video: '/tutorial-step4.mp4',
    },
  ];

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsPlaying(false);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glassmorphism-strong rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
                <div>
                  <h2 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                    {currentStepData.title}
                  </h2>
                  <p className="text-dark-600 dark:text-dark-400 mt-1">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Section */}
              <div className="relative aspect-video bg-dark-900">
                <video
                  className="w-full h-full object-cover"
                  autoPlay={isPlaying}
                  muted
                  loop={false}
                  src={currentStepData.video}
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center shadow-neon-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg text-dark-700 dark:text-dark-300 mb-6">
                  {currentStepData.description}
                </p>

                {/* Progress Steps */}
                <div className="flex gap-2 mb-6">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-primary-500'
                          : index < currentStep
                          ? 'bg-primary-300'
                          : 'bg-dark-200 dark:bg-dark-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip Tutorial
                  </Button>
                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(currentStep - 1);
                          setIsPlaying(false);
                        }}
                      >
                        Previous
                      </Button>
                    )}
                    <Button onClick={handleNext}>
                      {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                      <SkipForward className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

