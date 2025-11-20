import { motion } from 'framer-motion';
import { User, Mic2 } from 'lucide-react';

export default function InterviewAvatar({ isSpeaking, language }) {
  return (
    <div className="relative">
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-xl">
        {/* Avatar Circle */}
        <div className="relative mx-auto w-48 h-48 mb-6">
          <motion.div
            animate={isSpeaking ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: isSpeaking ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
          >
            <User className="w-24 h-24 text-white" />
          </motion.div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full border-4 border-cyan-400"
            />
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          {isSpeaking ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400"
            >
              <Mic2 className="w-5 h-5" />
              <span className="font-medium">Speaking...</span>
            </motion.div>
          ) : (
            <div className="text-dark-600 dark:text-dark-400">
              <span className="font-medium">AI Interviewer</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

