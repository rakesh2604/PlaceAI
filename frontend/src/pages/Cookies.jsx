import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';
import { Cookie } from 'lucide-react';

export default function Cookies() {
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
              <Cookie className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-manrope font-bold text-dark-900 dark:text-dark-100">
                Cookie Policy
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
                1. What Are Cookies
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                2. Types of Cookies We Use
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-dark-700 dark:text-dark-300">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and load balancing.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-dark-700 dark:text-dark-300">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-100 mb-2">
                    Preference Cookies
                  </h3>
                  <p className="text-dark-700 dark:text-dark-300">
                    These cookies remember your preferences and settings to provide a personalized experience.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                3. Managing Cookies
              </h2>
              <p className="text-dark-700 dark:text-dark-300 mb-4">
                You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can impact your user experience.
              </p>
              <p className="text-dark-700 dark:text-dark-300">
                Most browsers allow you to refuse or accept cookies. You can also delete cookies that have already been set.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-dark-900 dark:text-dark-100 mb-4">
                4. Third-Party Cookies
              </h2>
              <p className="text-dark-700 dark:text-dark-300">
                We may use third-party services that set cookies on your device. These services help us analyze website usage and improve our services.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

