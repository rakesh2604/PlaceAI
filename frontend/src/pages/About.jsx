import { motion } from 'framer-motion';
import { Sparkles, Target, Users, Heart, GraduationCap, Building2, Briefcase, Code, Globe, Shield, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import AnimatedCard from '../components/ui/AnimatedCard';
import Button from '../components/ui/Button';

export default function About() {
  const workCulture = [
    {
      icon: Globe,
      title: 'Remote-Friendly',
      description: 'We believe in work-life balance and support remote work. Our team collaborates across time zones.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Lightbulb,
      title: 'Learning-Focused',
      description: 'Continuous learning is at our core. We invest in our team\'s growth and encourage experimentation.',
      color: 'from-cyan-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Students-First',
      description: 'Every decision we make prioritizes student success. We build features that truly help students.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Shield,
      title: 'Ethical AI Usage',
      description: 'We use AI responsibly, ensuring fairness, transparency, and no bias in our algorithms.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const beliefs = [
    {
      icon: Target,
      title: 'Transparency',
      description: 'We believe in being open about our processes, pricing, and how we use student data.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Fairness',
      description: 'Every student deserves equal opportunities, regardless of their college tier or background.',
      color: 'from-cyan-500 to-indigo-500'
    },
    {
      icon: Code,
      title: 'Access to Opportunities',
      description: 'We break down barriers and make quality placement preparation accessible to all.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Practice interviews, improve resumes, and get matched with the right opportunities.',
      features: ['AI-powered mock interviews', 'Resume analysis & ATS scoring', 'Personalized job recommendations', 'Interview feedback & analytics']
    },
    {
      icon: Building2,
      title: 'Colleges',
      description: 'Automate placement processes and track student performance.',
      features: ['Placement tracking dashboard', 'Student analytics', 'Recruiter management', 'Bulk interview scheduling']
    },
    {
      icon: Briefcase,
      title: 'Recruiters',
      description: 'Access pre-screened talent and streamline your hiring process.',
      features: ['AI candidate matching', 'Pre-screened talent pool', 'Interview insights', 'Streamlined hiring']
    }
  ];

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      
      {/* Hero */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#F5F8FF] dark:bg-dark-900" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-6 border border-cyan-500/30"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
              About PlacedAI
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-6"
          >
            Empowering Indian Students to Ace Placements
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto"
          >
            We're on a mission to make placement preparation accessible, affordable, and effective for every student in India.
          </motion.p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AnimatedCard className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                  Who We Are
                </h2>
              </div>
              <p className="text-lg text-dark-700 dark:text-dark-300 leading-relaxed mb-4">
                PlacedAI is an AI-powered placement preparation platform designed specifically for Indian students. We combine cutting-edge artificial intelligence with deep understanding of the Indian campus placement ecosystem to help students from any college crack their dream placements.
              </p>
              <p className="text-lg text-dark-600 dark:text-dark-400 leading-relaxed">
                Our platform offers AI-powered mock interviews, ATS resume scoring, personalized job recommendations, and real-time feedback—all tailored to the unique challenges faced by Indian students during campus placements.
              </p>
            </AnimatedCard>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Our Mission"
            subtitle="Helping Indian students from any college crack placements"
          />
          <div className="max-w-4xl mx-auto mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <AnimatedCard className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                    Democratizing Placement Success
                  </h3>
                </div>
                <p className="text-lg text-dark-700 dark:text-dark-300 leading-relaxed mb-4">
                  Our mission is to democratize access to quality placement preparation for every Indian student, regardless of college tier or background. We believe that talent is distributed equally, but opportunities are not.
                </p>
                <p className="text-lg text-dark-600 dark:text-dark-400 leading-relaxed">
                  Whether you're from an IIT, NIT, or a Tier-3 college, PlacedAI provides you with the same high-quality AI-powered tools and insights to prepare for placements. We're here to level the playing field and help every student achieve their career goals.
                </p>
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Our Story"
            subtitle="Built by engineers who went through Indian campus hiring"
          />
          <div className="max-w-4xl mx-auto mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <AnimatedCard className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                    From Experience to Innovation
                  </h3>
                </div>
                <p className="text-lg text-dark-700 dark:text-dark-300 leading-relaxed mb-4">
                  PlacedAI was born from our own experiences navigating the Indian campus placement process. As engineers who went through the rigorous placement cycles at various Indian colleges, we understand the challenges firsthand—the anxiety, the lack of practice opportunities, the uncertainty about what recruiters expect.
                </p>
                <p className="text-lg text-dark-600 dark:text-dark-400 leading-relaxed mb-4">
                  We saw how students from Tier-1 colleges had access to better resources and more practice opportunities, while students from other colleges struggled to find quality preparation tools. This inequality inspired us to build PlacedAI—a platform that gives every student access to world-class AI-powered placement preparation.
                </p>
                <p className="text-lg text-dark-600 dark:text-dark-400 leading-relaxed">
                  Today, PlacedAI helps thousands of students prepare for placements, regardless of their college tier. We're proud to be part of their journey and committed to making placement success accessible to all.
                </p>
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Work Culture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Our Work Culture"
            subtitle="How we build and grow together"
          />
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {workCulture.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatedCard className="p-8 h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                      {item.description}
                    </p>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Believe In */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="What We Believe In"
            subtitle="Our core values and principles"
          />
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {beliefs.map((belief, index) => {
              const Icon = belief.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatedCard className="p-8 text-center h-full">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${belief.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4">
                      {belief.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                      {belief.description}
                    </p>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Who We Serve"
            subtitle="Built for the Indian placement ecosystem"
          />
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <AnimatedCard className="p-8 h-full">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-3">
                      {audience.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 mb-6">
                      {audience.description}
                    </p>
                    <ul className="space-y-2">
                      {audience.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-700 dark:text-dark-300">
                          <span className="text-cyan-500 mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AnimatedCard className="p-12">
              <h2 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-dark-600 dark:text-dark-400 mb-8 text-lg">
                Join thousands of students who are already preparing for placements with PlacedAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="group">
                    Sign up Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">View Pricing</Button>
                </Link>
              </div>
            </AnimatedCard>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

