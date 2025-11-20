import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variantStyles = {
  default: 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full',
        'text-xs font-medium',
        'transition-colors duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
