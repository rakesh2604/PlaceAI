import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Globe, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { userApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Card from '../../components/ui/Card';

const languages = [
  { value: 'English', label: 'English', flag: '🇬🇧' },
  { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
  { value: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'Mandarin', label: 'Mandarin', flag: '🇨🇳' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OnboardingDetails() {
  const [phone, setPhone] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [ctc, setCtc] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userApi.updateBasic({
        phone,
        languages: selectedLanguages,
        ctc: ctc ? parseFloat(ctc) : undefined,
        resume
      });
      if (response.data.user) {
        updateUser(response.data.user);
      }
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-dark-100 mb-3"
          >
            Complete Your{' '}
            <span className="gradient-text">Profile</span>
          </motion.h1>
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Help us understand your background and preferences
          </p>
        </motion.div>

        <Card className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300 mb-4">
                <User className="w-5 h-5" />
                <label className="text-sm font-semibold">Contact Information</label>
              </div>
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300 mb-2">
                <Globe className="w-5 h-5" />
                <label className="text-sm font-semibold">Languages</label>
              </div>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang.value);
                  return (
                    <motion.button
                      key={lang.value}
                      type="button"
                      onClick={() => handleLanguageToggle(lang.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        px-4 py-2.5 rounded-xl border-2 font-medium transition-all duration-300
                        ${isSelected
                          ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30'
                          : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 border-dark-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600'
                        }
                      `}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300 mb-4">
                <DollarSign className="w-5 h-5" />
                <label className="text-sm font-semibold">Compensation</label>
              </div>
              <Input
                label="Current CTC (Annual Salary)"
                type="number"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="120000"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300 mb-4">
                <FileText className="w-5 h-5" />
                <label className="text-sm font-semibold">Resume</label>
              </div>
              <FileUpload
                label="Upload Resume (PDF, DOC, DOCX)"
                accept=".pdf,.doc,.docx"
                onChange={setResume}
                error={error}
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full group"
                disabled={loading || !phone || selectedLanguages.length === 0 || !resume}
                loading={loading}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
