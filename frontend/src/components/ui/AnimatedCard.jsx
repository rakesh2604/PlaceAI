import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AnimatedCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  glow = false,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? {
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 },
            }
          : {}
      }
      className={cn(
        'rounded-2xl p-6',
        'bg-white dark:bg-[rgba(255,255,255,0.03)]',
        'border border-dark-200 dark:border-[rgba(255,255,255,0.08)]',
        'shadow-soft hover:shadow-xl dark:shadow-[0px_4px_20px_rgba(0,0,0,0.6)]',
        'transition-all duration-300',
        'dark:text-[#E2E8F0]',
        hover && 'cursor-pointer',
        glow && 'neon-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

