import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { FileText } from 'lucide-react';

export default function Terms() {
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
              <FileText className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                By accessing and using PlacedAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                2. Use License
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                Permission is granted to temporarily use PlacedAI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on PlacedAI</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                3. User Accounts
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                4. Subscription Plans
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                PlacedAI offers various subscription plans with different features and usage limits. By subscribing to a plan, you agree to pay the applicable fees. Subscriptions automatically renew unless cancelled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                5. Limitation of Liability
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                In no event shall PlacedAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PlacedAI.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                6. Contact Information
              </h2>
              <p className="text-dark-700 dark:text-dark-300">
                If you have any questions about these Terms, please contact us at contact@placedai.com
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

