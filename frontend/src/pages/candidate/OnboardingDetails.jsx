import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Globe, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { userApi } from '../../services/candidateApi';
import PhoneInputIntl from '../../components/ui/PhoneInputIntl';
import CurrencyInput from '../../components/ui/CurrencyInput';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
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
  const { updateUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [compensationPaise, setCompensationPaise] = useState(0);
  const [resume, setResume] = useState(null);
  const [resumeMetadata, setResumeMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Load user profile on mount - always fetch fresh data from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await userApi.getProfile();
        if (response.data?.success && response.data?.user) {
          const profileUser = response.data.user;
          // Always use fresh backend data, not stale local state
          setPhone(profileUser.phone || '');
          setSelectedLanguages(profileUser.languages || []);
          setCompensationPaise(profileUser.compensationPaise || 0);
          setResumeMetadata(profileUser.resume || null);
        }
      } catch (err) {
        setError('Failed to load profile. Please refresh the page.');
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  const handleResumeUpload = async (file) => {
    if (!file) {
      setResume(null);
      setResumeMetadata(null);
      return;
    }
    
    setUploadingResume(true);
    setError('');
    
    try {
      const response = await userApi.uploadResume(file);
      if (response.data?.success && response.data?.resume) {
        setResumeMetadata(response.data.resume);
        setResume(file); // Keep file reference for form submission if needed
        
        // Update user in store if backend returns updated user
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to upload resume');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to upload resume';
      setError(errorMsg);
      setResume(null);
      setResumeMetadata(null);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Client-side validation
    if (!phone) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    
    if (selectedLanguages.length === 0) {
      setError('Please select at least one language');
      setLoading(false);
      return;
    }
    
    if (!resumeMetadata && !resume) {
      setError('Resume upload is required');
      setLoading(false);
      return;
    }

    try {
      // Validate compensation is not negative (0 is allowed for freshers)
      if (compensationPaise < 0) {
        setError('Compensation cannot be negative');
        setLoading(false);
        return;
      }

      const updatePayload = {
        phone,
        languages: selectedLanguages,
        compensationPaise: compensationPaise !== null && compensationPaise !== undefined ? compensationPaise : undefined
      };
      
      // Include resumeId if resume was already uploaded
      if (resumeMetadata?.id) {
        updatePayload.resumeId = resumeMetadata.id;
      }
      
      const response = await userApi.updateProfile(updatePayload);
      
      if (response.data?.success && response.data?.user) {
        // Update user store with complete user object from backend
        updateUser(response.data.user);
        setSuccess(true);
        
        // Clear form errors
        setError('');
        
        // Navigate to dashboard after brief delay to show success message
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setError(response.data?.error || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Failed to update profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
            Add your phone number, languages, compensation, and upload your resume to get started
          </p>
        </motion.div>

        <Card className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300 mb-4">
                <User className="w-5 h-5" />
                <label className="text-sm font-semibold">Contact Information</label>
              </div>
              <PhoneInputIntl
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                error={error && !phone ? 'Phone number is required' : undefined}
                required
                defaultCountry="IN"
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
              <CurrencyInput
                label="Current CTC (Annual, INR)"
                value={compensationPaise}
                onChange={setCompensationPaise}
                currency="INR"
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
                onChange={handleResumeUpload}
                showMetadata={true}
                fileMetadata={resumeMetadata}
                maxSize={5 * 1024 * 1024}
              />
              {uploadingResume && (
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Uploading resume...
                </p>
              )}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <p className="text-sm text-green-600 dark:text-green-400">
                  Profile updated successfully! Redirecting...
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full group"
                disabled={loading || uploadingResume || !phone || selectedLanguages.length === 0 || (!resumeMetadata && !resume)}
                loading={loading || uploadingResume}
              >
                {loading || uploadingResume ? 'Saving...' : 'Save & Continue'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
