import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Input({
  label,
  error,
  className = '',
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  const showLabel = focused || hasValue;

  return (
    <div className="w-full relative">
      <div className="relative">
        <motion.input
          type={type}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full px-4 pt-6 pb-2',
            'bg-white dark:bg-dark-800',
            'border-2 rounded-xl',
            'text-dark-900 dark:text-dark-100',
            'placeholder:text-dark-400 dark:placeholder:text-dark-500',
            'transition-all duration-300',
            'focus:outline-none',
            focused && !error
              ? 'border-primary-500 shadow-lg shadow-primary-500/20'
              : error
              ? 'border-red-500 shadow-lg shadow-red-500/20'
              : 'border-dark-200 dark:border-dark-700',
            className
          )}
          placeholder={focused ? placeholder : ''}
          required={required}
          {...props}
        />
        <AnimatePresence>
          {label && (
            <motion.label
              initial={false}
              animate={{
                y: showLabel ? -8 : 16,
                x: showLabel ? 0 : 0,
                scale: showLabel ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute left-4 pointer-events-none',
                'transition-colors duration-300',
                showLabel
                  ? focused
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-dark-500 dark:text-dark-400'
                  : 'text-dark-400 dark:text-dark-500'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500 flex items-center gap-1"
          >
            <span>⚠</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
