import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Careers() {
  const openPositions = [
    {
      title: 'Senior Full-Stack Engineer',
      location: 'Remote / Bangalore',
      type: 'Full-time',
      description: 'Build and scale our AI-powered platform for Indian students.'
    },
    {
      title: 'AI/ML Engineer',
      location: 'Remote / Hyderabad',
      type: 'Full-time',
      description: 'Develop and improve our interview AI and resume scoring systems.'
    },
    {
      title: 'Product Designer',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design beautiful and intuitive experiences for students preparing for placements.'
    }
  ];

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-4">
              Join the PlacedAI Team
            </h1>
            <p className="text-xl text-dark-600 dark:text-dark-400">
              Help us revolutionize job preparation for Indian students
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
              Why Work With Us
            </h2>
            <ul className="space-y-3 text-dark-700 dark:text-dark-300">
              <li>• Work on cutting-edge AI technology that helps students succeed</li>
              <li>• Remote-first culture with flexible working hours</li>
              <li>• Competitive compensation and equity</li>
              <li>• Impact the lives of thousands of Indian students</li>
              <li>• Collaborative and supportive team environment</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-6">
              Open Positions
            </h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
                        {position.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-dark-600 dark:text-dark-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Briefcase className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-dark-700 dark:text-dark-300 mb-4">
                    {position.description}
                  </p>
                  <Button variant="outline" size="sm">
                    Apply Now
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-center"
          >
            <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
              Don't see a role that fits?
            </h3>
            <p className="text-dark-600 dark:text-dark-400 mb-4">
              We're always looking for talented people. Send us your resume at careers@placedai.com
            </p>
            <Button>
              Send Resume
            </Button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

