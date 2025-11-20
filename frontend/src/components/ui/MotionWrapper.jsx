import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function MotionWrapper({
  children,
  className = '',
  stagger = true,
  ...props
}) {
  return (
    <motion.div
      variants={stagger ? containerVariants : undefined}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={cn(className)}
      {...props}
    >
      {stagger ? (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}

