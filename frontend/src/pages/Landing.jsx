import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, Play, ArrowRight, TrendingUp, Users, Building2, Briefcase, 
  CheckCircle2, Video, FileText, MessageSquare, Target, Zap, Star,
  Award, BarChart3, Clock, Globe, GraduationCap, IndianRupee, Quote
} from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import MotionWrapper from '../components/ui/MotionWrapper';
import AnimatedCard from '../components/ui/AnimatedCard';
import PricingCard from '../components/ui/PricingCard';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import MeetPlacedAI from '../components/sections/MeetPlacedAI';
import ChatWidget from '../components/ui/ChatWidget';
import AnimatedCounter from '../components/sections/AnimatedCounter';
import PlacedAIVideo from '../components/PlacedAIVideo';

// Floating glowing icons component with enhanced motion
const FloatingGlowIcon = ({ icon: Icon, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.4, 0.9, 0.4],
      scale: [1, 1.3, 1],
      y: [0, -40, 0],
      rotate: [0, 15, 0],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`absolute ${className}`}
  >
    <div className="relative">
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-cyan-500/40 blur-2xl rounded-full"
      />
      <Icon className="w-10 h-10 text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]" />
    </div>
  </motion.div>
);

// Enhanced particle effect
const Particle = ({ delay = 0 }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 3 + Math.random() * 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0 }}
      animate={{
        opacity: [0, 1, 0],
        y: [-100, window.innerHeight + 100],
        x: [0, randomX - 50],
      }}
      transition={{
        duration: randomDuration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full blur-sm"
      style={{ left: `${randomX}%` }}
    />
  );
};

// Partner companies marquee
const PartnerMarquee = () => {
  const companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCL', 'Tech Mahindra', 'Capgemini'];
  
  return (
    <div className="overflow-hidden py-8">
      <motion.div
        animate={{
          x: [0, -1600],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex gap-12"
      >
        {[...companies, ...companies].map((company, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1 }}
            className="text-2xl font-bold text-dark-400 dark:text-[#E2E8F0] whitespace-nowrap"
          >
            {company}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Enhanced Hero Section
const HeroSection = () => {
  const { user, token } = useAuthStore();

  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-40">
      {/* Hero section - exact dark gradient */}
      <div className="absolute inset-0 bg-[#F5F8FF]">
        <div className="hidden dark:block absolute inset-0" style={{
          background: 'linear-gradient(180deg, #000814 0%, #001D3D 70%, #003566 100%)'
        }} />

        {/* Enhanced animated light streaks */}
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 5 + i,
              delay: i * 0.8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-sm"
            style={{ left: `${15 + i * 12}%` }}
          />
        ))}

        {/* Floating glowing icons */}
        <FloatingGlowIcon icon={Sparkles} delay={0} className="top-20 left-10" />
        <FloatingGlowIcon icon={TrendingUp} delay={1} className="top-40 right-20" />
        <FloatingGlowIcon icon={Users} delay={2} className="bottom-40 left-20" />
        <FloatingGlowIcon icon={Target} delay={1.5} className="bottom-20 right-10" />
        <FloatingGlowIcon icon={Zap} delay={0.5} className="top-1/2 left-1/4" />
        <FloatingGlowIcon icon={Briefcase} delay={2.5} className="top-1/2 right-1/4" />

        {/* Enhanced particle effects */}
        {[...Array(30)].map((_, i) => (
          <Particle key={i} delay={i * 0.15} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-6 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <span className="text-sm font-medium text-dark-700 dark:text-[#E2E8F0]">
              AI-Powered Job Preparation for Indian Students
            </span>
          </motion.div>
        </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, type: 'spring' }}
              className="text-5xl md:text-7xl lg:text-8xl font-manrope font-bold text-dark-900 dark:text-[#F8F9FA] mb-6 leading-tight"
            >
          Campus placements made{' '}
          <motion.span
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            simpler
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl lg:text-3xl text-dark-600 dark:text-[#CBD5E1] mb-4 max-w-3xl mx-auto font-medium"
        >
          One platform for interview practice, AI feedback, and job connections
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-xl text-dark-500 dark:text-[#CBD5E1] mb-12 max-w-2xl mx-auto"
        >
          Designed specifically for Indian college students preparing for campus placements
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          {token && user ? (
            <Link to="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="group shadow-neon">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="group shadow-neon">
                    Sign up Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" className="group border-2 border-cyan-500/50 hover:border-cyan-500">
                    Try Demo Interview
                    <Play className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </motion.div>

        {/* Partner companies */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20"
        >
          <p className="text-sm text-dark-500 dark:text-[#E2E8F0] mb-4">
            Trusted by students from top companies
          </p>
          <PartnerMarquee />
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Trust Building Section with animated counters
const TrustSection = () => {
  const stats = [
    { icon: GraduationCap, value: 100, suffix: '+', label: 'Colleges', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, value: 85, suffix: '%', label: 'Felt More Confident', color: 'from-cyan-500 to-blue-500' },
    { icon: Award, value: 92, suffix: '%', label: 'Matched Recruiter Expectations', color: 'from-indigo-500 to-purple-500' },
    { icon: MessageSquare, value: 50000, suffix: '+', label: 'Questions Answered', color: 'from-purple-500 to-pink-500' },
    { icon: Video, value: 10000, suffix: '+', label: 'Demo Interviews', color: 'from-pink-500 to-rose-500' },
  ];

  const colleges = ['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'IIIT Hyderabad', 'VIT Vellore'];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Section Dark 1 */}
      <div className="absolute inset-0 bg-white dark:bg-[#000B1D]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-6 border border-cyan-500/30">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-dark-700 dark:text-[#E2E8F0]">
              Built for Indian Students
            </span>
          </div>
        </motion.div>
        <SectionHeader
          title="Trusted by Students Across India"
          subtitle="Join thousands of students from Tier-1, Tier-2, and Tier-3 colleges who are acing their campus placements"
        />

        {/* Enhanced Stats Grid with hover effects */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="relative"
              >
                <AnimatedCard className="text-center border-2 border-transparent hover:border-cyan-500/30 transition-all">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg relative`}
                  >
                    <Icon className="w-8 h-8 text-white relative z-10" />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} blur-lg`}
                    />
                  </motion.div>
                  <div className="text-3xl md:text-4xl font-manrope font-bold text-dark-900 dark:text-[#F8F9FA] mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-dark-600 dark:text-[#E2E8F0]">{stat.label}</div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced College Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mb-8"
        >
          <p className="text-lg font-medium text-dark-700 dark:text-[#E2E8F0] mb-6">
            Trusted by students from <AnimatedCounter end={100} suffix="+"/> colleges including:
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {colleges.map((college, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -5, rotate: 2 }}
                className="px-6 py-3 rounded-lg glassmorphism border border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span className="text-dark-700 dark:text-[#E2E8F0] font-medium">{college}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* India-specific messaging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-12 p-6 rounded-2xl glassmorphism border border-cyan-500/20"
        >
          <p className="text-dark-700 dark:text-[#E2E8F0] font-medium mb-2">
            Built by engineers who went through Indian campus placements
          </p>
          <p className="text-sm text-dark-600 dark:text-[#E2E8F0]">
            Designed for freshers, first-gen learners, and early-career professionals from Tier-2 & Tier-3 campuses
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      college: 'IIT Delhi',
      role: 'Software Engineer at Microsoft',
      image: '👩‍💼',
      rating: 5,
      text: 'PlacedAI helped me practice for my Microsoft interview. The AI feedback was incredibly detailed and matched what real recruiters asked. Real interview-style questions based on Indian companies made all the difference.',
      improvements: ['Improved confidence by 90%', 'Better structured answers', 'Handled technical questions better'],
    },
    {
      name: 'Rahul Kumar',
      college: 'NIT Trichy',
      role: 'Data Scientist at Amazon',
      image: '👨‍💻',
      rating: 5,
      text: 'As a Tier-2 college student, I was worried about placements. PlacedAI gave me the practice I needed to compete with Tier-1 students. The non-English speaker support helped me express myself better.',
      improvements: ['Resume score improved from 65% to 92%', 'Got 3 job offers', 'Better communication skills'],
    },
    {
      name: 'Ananya Patel',
      college: 'BITS Pilani',
      role: 'Product Manager at Google',
      image: '👩‍🎓',
      rating: 5,
      text: 'The personalized feedback helped me understand my weak areas. The AI interview questions were spot-on for product management roles at Indian tech companies.',
      improvements: ['Clearer thought process', 'Better problem-solving approach', 'Improved presentation skills'],
    },
    {
      name: 'Vikram Singh',
      college: 'IIIT Hyderabad',
      role: 'ML Engineer at Flipkart',
      image: '👨‍🔬',
      rating: 5,
      text: 'PlacedAI\'s resume analysis caught issues I didn\'t know about. The interview practice was exactly what I needed for ML roles. Local salary guidance helped me negotiate better.',
      improvements: ['Resume optimized for ATS', 'Technical depth improved', 'Got placed in dream company'],
    },
  ];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium dark background */}
      <div className="absolute inset-0 bg-white dark:bg-[#001225]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          title="What Students Say"
          subtitle="Real stories from students who transformed their placement journey"
        />

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02, rotateY: 2 }}
              style={{ perspective: 1000 }}
            >
              <AnimatedCard className="h-full border-2 border-transparent hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                  >
                    {testimonial.image}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-xl font-manrope font-bold text-dark-900 dark:text-[#F8F9FA]">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-dark-600 dark:text-[#E2E8F0]">{testimonial.college}</p>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-cyan-500/30" />
                  <p className="text-dark-700 dark:text-[#E2E8F0] italic pl-6">
                    "{testimonial.text}"
                  </p>
                </div>

                <div className="border-t border-dark-200 dark:border-[rgba(255,255,255,0.08)] pt-4">
                  <p className="text-sm font-semibold text-dark-900 dark:text-[#F8F9FA] mb-2">What they improved:</p>
                  <ul className="space-y-2">
                    {testimonial.improvements.map((improvement, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-dark-600 dark:text-[#E2E8F0]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                        {improvement}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: FileText,
      title: 'Sign up',
      description: 'Create your account with email verification',
      color: 'from-blue-500 to-cyan-500',
      direction: 'left',
    },
    {
      icon: Briefcase,
      title: 'Upload resume',
      description: 'Upload your resume for AI analysis',
      color: 'from-cyan-500 to-blue-500',
      direction: 'left',
    },
    {
      icon: Video,
      title: 'AI interview',
      description: 'Practice with AI-powered mock interviews',
      color: 'from-indigo-500 to-purple-500',
      direction: 'right',
    },
    {
      icon: MessageSquare,
      title: 'Get feedback',
      description: 'Receive detailed performance insights',
      color: 'from-purple-500 to-pink-500',
      direction: 'right',
    },
    {
      icon: Users,
      title: 'Connect with recruiters',
      description: 'Get matched with top companies',
      color: 'from-pink-500 to-rose-500',
      direction: 'right',
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Section Dark 3 */}
      <div className="absolute inset-0 bg-white dark:bg-[#00182F]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          title="How PlacedAI Works"
          subtitle="Get job-ready in 5 simple steps"
        />

        {/* Steps with enhanced animations */}
        <div className="relative mb-20">
          {/* Vertical connector line for desktop */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 via-indigo-500 via-purple-500 to-pink-500 transform -translate-y-1/2 opacity-20"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ 
                    opacity: 0, 
                    y: 50,
                    x: step.direction === 'left' ? -50 : step.direction === 'right' ? 50 : 0,
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    x: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8, type: 'spring' }}
                  whileHover={{ y: -12, scale: 1.05 }}
                  className="relative"
                >
                  <AnimatedCard className="text-center h-full border-2 border-transparent hover:border-cyan-500/30 transition-all">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg relative z-10`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                      <motion.div
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl`}
                      />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-dark-900 dark:text-[#F8F9FA] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-dark-600 dark:text-[#E2E8F0] text-sm">
                      {step.description}
                    </p>
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                        className="hidden md:block lg:hidden absolute top-1/2 -right-4 -translate-y-1/2 z-20"
                      >
                        <ArrowRight className="w-6 h-6 text-cyan-500" />
                      </motion.div>
                    )}
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <PlacedAIVideo />
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Business Model Section
const BusinessModelSection = () => {
  const models = [
    {
      icon: Users,
      title: 'For Students',
      description: 'Practice interviews, resume score, personalized guidance',
      features: [
        'AI-powered mock interviews',
        'Resume analysis & scoring',
        'Personalized feedback',
        'Job recommendations',
      ],
      indianFeatures: [
        'Tier-2 and Tier-3 college friendly',
        'Non-English speakers support',
        'Resume improvement for freshers',
        'Local salary guidance (₹)',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Building2,
      title: 'For Colleges',
      description: 'Placement automation dashboard',
      features: [
        'Automated placement tracking',
        'Student performance analytics',
        'Recruiter management',
        'Bulk interview scheduling',
      ],
      indianFeatures: [
        'Campus training modules',
        'Regional language support',
        'Indian company partnerships',
        'Placement rate tracking',
      ],
      color: 'from-cyan-500 to-indigo-500',
    },
    {
      icon: Briefcase,
      title: 'For Companies',
      description: 'Smart candidate screening',
      features: [
        'AI candidate matching',
        'Pre-screened talent pool',
        'Interview insights',
        'Streamlined hiring process',
      ],
      indianFeatures: [
        'Fresher-focused screening',
        'Campus recruitment automation',
        'Regional talent access',
        'Cost-effective hiring',
      ],
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium dark background */}
      <div className="absolute inset-0 bg-white dark:bg-[#000B1D]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          title="Why PlacedAI Works in India"
          subtitle="Built for the Indian job market, designed for success"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model, index) => {
            const Icon = model.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <AnimatedCard className="h-full border-2 border-transparent hover:border-cyan-500/30 transition-all">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-[#F8F9FA] mb-2">
                    {model.title}
                  </h3>
                  <p className="text-dark-600 dark:text-[#E2E8F0] mb-6">
                    {model.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-dark-900 dark:text-[#F8F9FA] mb-3">Core Features:</p>
                    <ul className="space-y-2 mb-6">
                      {model.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                          <span className="text-dark-700 dark:text-[#E2E8F0] text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-dark-200 dark:border-dark-700 pt-4">
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      India-Specific:
                    </p>
                    <ul className="space-y-2">
                      {model.indianFeatures.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + i * 0.1 + 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <IndianRupee className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                          <span className="text-dark-700 dark:text-[#E2E8F0] text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Enhanced Pricing Section
const PricingSection = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const pricingPlans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started',
      features: [
        '3 AI interviews per month',
        'Basic resume analysis',
        'Job recommendations',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Premium',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      description: 'For serious job seekers',
      features: [
        'Unlimited AI interviews',
        'Advanced resume scoring',
        'Personalized feedback',
        'Priority job matching',
        '24/7 support',
        'Interview analytics',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 9999,
      yearlyPrice: 99990,
      description: 'For colleges & institutions',
      features: [
        'Everything in Premium',
        'Bulk student management',
        'Custom branding',
        'Dedicated account manager',
        'API access',
        'Advanced analytics',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Section Dark 1 - Pricing */}
      <div className="absolute inset-0 bg-white dark:bg-[#00182F]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          title="Simple, Transparent Pricing"
          subtitle="Choose the plan that works best for you"
        />

        {/* Enhanced Animated Billing Toggle */}
        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glassmorphism rounded-full p-1.5 inline-flex gap-2 border border-cyan-500/30">
            <motion.button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-8 py-3 rounded-full font-medium transition-all relative ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-dark-600 dark:text-[#E2E8F0] hover:text-cyan-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={billingPeriod === 'monthly' ? { scale: 1 } : { scale: 1 }}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-8 py-3 rounded-full font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-dark-600 dark:text-[#E2E8F0] hover:text-cyan-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={billingPeriod === 'yearly' ? { scale: 1 } : { scale: 1 }}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={plan.popular ? {
                scale: [1, 1.02, 1],
              } : {}}
              transition={plan.popular ? {
                opacity: { delay: index * 0.15, duration: 0.8 },
                y: { delay: index * 0.15, duration: 0.8 },
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              } : { delay: index * 0.15, duration: 0.8 }}
            >
              <PricingCard
                name={plan.name}
                price={billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                period={billingPeriod === 'monthly' ? 'month' : 'year'}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                delay={index * 0.1}
                onSelect={() => {
                  if (token && user) {
                    // Navigate to pricing page for logged in users
                    window.location.href = '/pricing';
                  } else {
                    // Navigate to signup for non-logged in users
                    navigate('/login', { state: { planId: plan.name.toLowerCase() } });
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Landing Page
export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <TrustSection />
      <MeetPlacedAI />
      <HowItWorksSection />
      <TestimonialsSection />
      <BusinessModelSection />
      <PricingSection />
      <Footer />
      <ChatWidget />
    </div>
  );
}
