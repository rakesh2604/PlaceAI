import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function SectionHeader({
  title,
  subtitle,
  className = '',
  align = 'center'
}) {
  const alignClasses = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('mb-12', alignClasses[align], className)}
    >
      <motion.h2
        className="text-4xl md:text-5xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: '100px' }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className={cn(
          'h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full mt-6',
          align === 'center' ? 'mx-auto' : align === 'left' ? 'ml-0' : 'ml-auto'
        )}
      />
    </motion.div>
  );
}

