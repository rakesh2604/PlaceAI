import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
  secondary: 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100 hover:bg-dark-200 dark:hover:bg-dark-700 border border-dark-200 dark:border-dark-700',
  outline: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
  ghost: 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30',
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative inline-flex items-center justify-center',
        'font-medium rounded-xl',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      <span className={cn(loading && 'opacity-0')}>{children}</span>
    </motion.button>
  );
}
