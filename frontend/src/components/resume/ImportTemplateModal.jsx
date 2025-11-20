import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/api';

export default function ImportTemplateModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase().split('.').pop();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF and DOCX files are allowed');
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('template', file);

      const response = await api.post('/resume-builder/import-template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.resume) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.data.resume);
          handleClose();
        }, 1500);
      } else {
        setError('Failed to import template. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to import template. Template may be too complex to parse.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Your Own Template" size="lg">
      <div className="space-y-6">
        {!success ? (
          <>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                <p className="text-sm text-dark-700 dark:text-dark-300">
                  Upload a PDF or DOCX resume template. We'll extract the layout, sections, and styling so you can use your own design with ATS-optimized content.
                </p>
              </div>

              <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-dark-400 dark:text-dark-500" />
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="template-upload"
                />
                <label
                  htmlFor="template-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Choose File
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

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="text-xs text-dark-500 dark:text-dark-500 space-y-1">
                <p>• Supported formats: PDF, DOCX</p>
                <p>• Maximum file size: 10MB</p>
                <p>• We'll detect sections like Summary, Experience, Education, Skills, etc.</p>
                <p>• Layout, fonts, and styling will be preserved</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading} loading={uploading}>
                Import Template
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-2">
              Template Imported Successfully!
            </h3>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Your template has been processed and is ready to use.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

