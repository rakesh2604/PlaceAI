import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                Privacy Policy
              </h1>
            </div>
            <p className="text-dark-600 dark:text-dark-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Email address and contact information</li>
                <li>Resume and profile data</li>
                <li>Interview recordings and responses</li>
                <li>Payment and billing information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                3. Data Security
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                4. Your Rights
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                5. Contact Us
              </h2>
              <p className="text-dark-700 dark:text-dark-300">
                For privacy-related inquiries, contact us at privacy@placedai.com
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

