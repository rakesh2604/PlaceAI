import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { RefreshCw } from 'lucide-react';

export default function Refund() {
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
              <RefreshCw className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                Refund & Cancellation Policy
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
                1. Refund Eligibility
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                You may request a refund within 7 days of your initial subscription purchase if you are not satisfied with our service. Refunds are processed within 5-10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                2. Cancellation Policy
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. You will continue to have access to premium features until the end of the period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                3. Non-Refundable Items
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Subscriptions cancelled after 7 days from purchase</li>
                <li>Usage-based charges already consumed</li>
                <li>Enterprise plans with custom contracts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                4. How to Request a Refund
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-dark-700 dark:text-dark-300">
                <li>Contact us at support@placedai.com</li>
                <li>Include your account email and transaction ID</li>
                <li>State the reason for your refund request</li>
                <li>We will review and process your request within 2 business days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                5. Contact Support
              </h2>
              <p className="text-dark-700 dark:text-dark-300">
                For refund and cancellation inquiries, email us at support@placedai.com
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

