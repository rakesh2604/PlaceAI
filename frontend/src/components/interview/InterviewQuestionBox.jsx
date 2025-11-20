import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export default function InterviewQuestionBox({ question, questionNumber }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
              Question {questionNumber}
            </span>
            {question.category && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                {question.category}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
            {question.text}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

