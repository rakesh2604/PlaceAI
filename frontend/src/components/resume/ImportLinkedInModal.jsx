import { useState } from 'react';
import { Linkedin, Upload, Link as LinkIcon, FileArchive, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';

export default function ImportLinkedInModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'zip'
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [importedData, setImportedData] = useState(null);

  const handleUrlChange = (e) => {
    setLinkedInUrl(e.target.value);
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase().split('.').pop();
      if (ext !== 'zip') {
        setError('Only ZIP files are allowed');
        setFile(null);
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImportURL = async () => {
    if (!linkedInUrl.trim()) {
      setError('Please enter a LinkedIn profile URL');
      return;
    }

    if (!linkedInUrl.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/resume-builder/import-linkedin-url', {
        url: linkedInUrl.trim()
      });

      if (response.data?.resume) {
        setImportedData(response.data.parsedData);
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.data.resume);
          handleClose();
        }, 2000);
      } else {
        setError('Failed to import LinkedIn profile. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to import LinkedIn profile. Please ensure the URL is public and accessible.');
    } finally {
      setUploading(false);
    }
  };

  const handleImportZIP = async () => {
    if (!file) {
      setError('Please select a ZIP file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('zip', file);

      const response = await api.post('/resume-builder/import-linkedin-zip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.resume) {
        setImportedData(response.data.parsedData);
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.data.resume);
          handleClose();
        }, 2000);
      } else {
        setError('Failed to import LinkedIn ZIP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to import LinkedIn ZIP. Please ensure the file is a valid LinkedIn data export.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setLinkedInUrl('');
    setFile(null);
    setError('');
    setSuccess(false);
    setImportedData(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import from LinkedIn" size="lg">
      <div className="space-y-6">
        {!success ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 border-b border-dark-200 dark:border-dark-700">
              <button
                onClick={() => {
                  setActiveTab('url');
                  setError('');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'url'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Enter Profile URL
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('zip');
                  setError('');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'zip'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4" />
                  Upload LinkedIn ZIP
                </div>
              </button>
            </div>

            {/* URL Import Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <p className="text-sm text-dark-700 dark:text-dark-300">
                    Enter your public LinkedIn profile URL. We'll extract your professional information including experience, education, skills, and more.
                  </p>
                </div>

                <div>
                  <Input
                    label="LinkedIn Profile URL"
                    type="url"
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={linkedInUrl}
                    onChange={handleUrlChange}
                  />
                </div>

                <div className="text-xs text-dark-500 dark:text-dark-500 space-y-1">
                  <p>• Profile must be public and accessible</p>
                  <p>• We'll extract: Name, Headline, Summary, Experience, Education, Skills, Projects, Certifications</p>
                  <p>• All data will be editable after import</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleClose} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportURL} disabled={!linkedInUrl.trim() || uploading} loading={uploading}>
                    Import from URL
                  </Button>
                </div>
              </div>
            )}

            {/* ZIP Import Tab */}
            {activeTab === 'zip' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <p className="text-sm text-dark-700 dark:text-dark-300">
                    Upload your LinkedIn data export ZIP file. Download it from LinkedIn Settings → Data Privacy → Get a copy of your data.
                  </p>
                </div>

                <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-dark-400 dark:text-dark-500" />
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                    id="linkedin-zip-upload"
                  />
                  <label
                    htmlFor="linkedin-zip-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <FileArchive className="w-4 h-4" />
                    Choose ZIP File
                  </label>
                  {file && (
                    <div className="mt-4">
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        Selected: <span className="font-medium">{file.name}</span>
                      </p>
                      <p className="text-xs text-dark-500 dark:text-dark-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-dark-500 dark:text-dark-500 space-y-1">
                  <p>• Maximum file size: 50MB</p>
                  <p>• Must be a valid LinkedIn data export ZIP</p>
                  <p>• Contains: Profile.json, Positions.json, Education.json, Skills.json, etc.</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleClose} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportZIP} disabled={!file || uploading} loading={uploading}>
                    Import from ZIP
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-2">
              LinkedIn Profile Imported Successfully!
            </h3>
            {importedData && (
              <div className="mt-4 p-4 rounded-lg bg-dark-100 dark:bg-dark-800 text-left">
                <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                  <span className="font-medium">Name:</span> {importedData.name || 'N/A'}
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                  <span className="font-medium">Experience:</span> {importedData.experience?.length || 0} positions
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                  <span className="font-medium">Education:</span> {importedData.education?.length || 0} entries
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  <span className="font-medium">Skills:</span> {importedData.skills?.length || 0} categories
                </p>
              </div>
            )}
            <p className="text-sm text-dark-600 dark:text-dark-400 mt-4">
              Your profile data has been imported and is ready to edit.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

