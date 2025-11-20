import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

export default function InterviewTranscriptStream({ transcript, finalTranscript, isRecording }) {
  const displayText = finalTranscript + transcript;
  const hasText = displayText.trim().length > 0;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        {isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-red-500"
          />
        ) : (
          <div className="w-3 h-3 rounded-full bg-gray-400" />
        )}
        <span className="font-semibold text-dark-900 dark:text-dark-100">
          {isRecording ? 'Listening...' : 'Not Recording'}
        </span>
        {isRecording ? (
          <Mic className="w-4 h-4 text-red-500" />
        ) : (
          <MicOff className="w-4 h-4 text-gray-400" />
        )}
      </div>

      <div className="min-h-[120px] p-4 bg-dark-50 dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-700">
        <AnimatePresence mode="wait">
          {hasText ? (
            <motion.p
              key="transcript"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-dark-900 dark:text-dark-100 text-lg leading-relaxed"
            >
              <span className="text-dark-700 dark:text-dark-300">{finalTranscript}</span>
              <span className="text-dark-500 dark:text-dark-500 italic">{transcript}</span>
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-dark-400 dark:text-dark-500 italic"
            >
              Your answer will appear here as you speak...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

