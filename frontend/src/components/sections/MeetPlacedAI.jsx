import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Briefcase, Share2, Target, Zap, Sparkles } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';

const features = [
  {
    icon: Calendar,
    title: 'Schedule AI Interviews',
    description: 'Practice anytime with AI-powered mock interviews',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    title: 'ATS Resume Scoring',
    description: 'Optimize your resume for Applicant Tracking Systems',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Real-time AI Feedback',
    description: 'Get instant feedback on your interview performance',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Briefcase,
    title: 'Personalized Job Suggestions',
    description: 'Get matched with roles that fit your profile',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'Get Resume Insights',
    description: 'AI analyzes your resume and suggests improvements',
    color: 'from-cyan-500 to-indigo-500',
  },
  {
    icon: Share2,
    title: 'Shareable Interview Feedback',
    description: 'Share your progress with mentors and peers',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function MeetPlacedAI() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Section Dark 2 - Meet PlacedAI */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50/30 to-white dark:bg-[#001628]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-6 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Meet Your AI Partner</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4">
            Meet PlacedAI – Your AI Placement Partner
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            Experience the power of AI-driven placement preparation designed for Indian students
          </p>
        </motion.div>

        {/* Grid Layout - Clean and Balanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0, 
                  y: 30,
                  scale: 0.9
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1
                }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="h-full"
              >
                <AnimatedCard 
                  className={`h-full text-center transition-all duration-300 cursor-pointer ${
                    hoveredCard === index 
                      ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30' 
                      : 'hover:border-cyan-500/40'
                  }`}
                >
                  <motion.div
                    animate={hoveredCard === index ? { 
                      scale: [1, 1.15, 1.1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transition-all duration-300 ${
                      hoveredCard === index ? 'shadow-cyan-500/50 scale-110' : ''
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-manrope font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-[#E2E8F0]">
                    {feature.description}
                  </p>
                  {hoveredCard === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t border-cyan-500/30"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 mx-auto rounded-full bg-cyan-500"
                      />
                    </motion.div>
                  )}
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-dark-600 dark:text-dark-400 mb-2 text-lg">
            Built by engineers who went through Indian campus placements
          </p>
          <p className="text-dark-500 dark:text-dark-500 text-sm">
            Designed for freshers and early-career professionals
          </p>
        </motion.div>
      </div>
    </section>
  );
}
