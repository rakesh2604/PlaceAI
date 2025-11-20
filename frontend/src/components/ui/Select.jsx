import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

export default function Select({ label, error, options = [], className = '', value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 appearance-none',
            'bg-white dark:bg-dark-800',
            'text-dark-900 dark:text-dark-100',
            'transition-all duration-300',
            'focus:outline-none',
            'pr-10',
            focused && !error
              ? 'border-primary-500 shadow-lg shadow-primary-500/20'
              : error
              ? 'border-red-500 shadow-lg shadow-red-500/20'
              : 'border-dark-200 dark:border-dark-700',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-dark-400 dark:text-dark-500" />
        </div>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
