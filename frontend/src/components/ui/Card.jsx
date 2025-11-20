import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Card({
  children,
  className = '',
  hover = true,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={cn(
        'glass rounded-2xl p-6',
        'shadow-soft hover:shadow-xl',
        'transition-all duration-300',
        hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

