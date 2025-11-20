import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export default function PricingCard({
  name,
  price,
  period = 'month',
  description,
  features = [],
  popular = false,
  delay = 0,
  onSelect,
  isCurrentPlan = false,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Wait 5 seconds before returning to normal
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 5000);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      animate={isHovered ? { y: -8, scale: 1.02 } : { y: 0, scale: 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative glassmorphism-strong rounded-3xl p-8',
        'shadow-soft',
        'transition-all duration-[450ms] ease-out',
        isHovered && 'shadow-xl border-cyan-500/50',
        popular && 'border-2 border-cyan-500 scale-105'
      )}
      {...props}
    >
      {popular && (
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="absolute -top-4 left-1/2 -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/50">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </div>
        </motion.div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
          {name}
        </h3>
        <p className="text-dark-600 dark:text-dark-400 mb-6">{description}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">₹{price}</span>
          <span className="text-dark-500 dark:text-dark-400">/{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-dark-700 dark:text-dark-300">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <Button
        variant={popular ? 'primary' : 'outline'}
        className="w-full"
        onClick={onSelect}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Current Plan' : 'Get Started'}
      </Button>
    </motion.div>
  );
}

