import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function InterviewTimer({ timeRemaining, totalTime }) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isLowTime = timeRemaining <= 10;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-500' : 'text-cyan-500'}`} />
          <span className="font-semibold text-dark-900 dark:text-dark-100">Time Remaining</span>
        </div>
        <span className={`text-2xl font-bold ${isLowTime ? 'text-red-500' : 'text-dark-900 dark:text-dark-100'}`}>
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="w-full h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full rounded-full ${
            isLowTime 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600'
          }`}
        />
      </div>
    </div>
  );
}

