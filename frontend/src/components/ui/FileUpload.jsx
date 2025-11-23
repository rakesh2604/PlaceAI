import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function FileUpload({
  label,
  accept,
  onChange,
  error,
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  showMetadata = false,
  fileMetadata = null,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (selectedFile.size > maxSize) {
      alert(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`);
      return;
    }
    
    // Validate file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
      if (!acceptedTypes.includes(fileExt) && !acceptedTypes.includes(selectedFile.type)) {
        alert(`File type not supported. Accepted: ${accept}`);
        return;
      }
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
    onChange?.(selectedFile);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  // Show metadata if provided (from backend)
  const displayFileName = fileMetadata?.filename || fileName;
  const displayFileSize = fileMetadata?.size || fileSize;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setFileName('');
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label}
        </label>
      )}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8',
          'cursor-pointer transition-all duration-300',
          'bg-white dark:bg-dark-800',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
            : error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-dark-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600',
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {file ? (
              <File className="w-12 h-12 text-primary-500" />
            ) : (
              <Upload className="w-12 h-12 text-dark-400 dark:text-dark-500" />
            )}
          </motion.div>
          <div className="text-center">
            {displayFileName ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dark-900 dark:text-dark-100">
                    {displayFileName}
                  </span>
                  <button
                    onClick={handleRemove}
                    className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                {displayFileSize && (
                  <span className="text-xs text-dark-500 dark:text-dark-400">
                    {formatFileSize(displayFileSize)}
                  </span>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-dark-900 dark:text-dark-100 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-dark-500 dark:text-dark-400">
                  {accept ? `Accepted: ${accept}` : 'Any file type'}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

