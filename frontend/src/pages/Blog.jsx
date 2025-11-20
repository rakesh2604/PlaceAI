import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { BookOpen, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'How to Ace Your Campus Placement Interviews',
      excerpt: 'Learn proven strategies and tips from successful candidates who landed their dream jobs.',
      author: 'PlacedAI Team',
      date: '2024-01-15',
      category: 'Interview Tips'
    },
    {
      id: 2,
      title: 'Understanding ATS: Optimize Your Resume for Success',
      excerpt: 'Everything you need to know about Applicant Tracking Systems and how to make your resume ATS-friendly.',
      author: 'PlacedAI Team',
      date: '2024-01-10',
      category: 'Resume Tips'
    },
    {
      id: 3,
      title: 'AI-Powered Interview Practice: The Future of Job Preparation',
      excerpt: 'Discover how AI is revolutionizing interview preparation and helping students succeed.',
      author: 'PlacedAI Team',
      date: '2024-01-05',
      category: 'Technology'
    }
  ];

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl md:text-5xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                PlacedAI Blog
              </h1>
            </div>
            <p className="text-xl text-dark-600 dark:text-dark-400">
              Tips, insights, and stories to help you succeed in your job search
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="p-6 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-3">
                  {post.title}
                </h2>
                <p className="text-dark-600 dark:text-dark-400 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-dark-500 dark:text-dark-500 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-dark-600 dark:text-dark-400 mb-4">
              More articles coming soon! Subscribe to stay updated.
            </p>
            <Link to="/contact">
              <button className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

