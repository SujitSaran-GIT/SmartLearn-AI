import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import {
  uploadFile,
  getUserFiles,
  deleteFile,
  clearError,
  setUploadProgress
} from '../redux/slices/fileSlice';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Clock,
  File as FileIcon,
  Download,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';

const UploadFile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { files, loading, error, uploadProgress, pagination } = useSelector((state: RootState) => state.files);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    const params: any = { page: currentPage, limit: 10 };
    if (statusFilter !== 'all') params.status = statusFilter;

    dispatch(getUserFiles(params));
  }, [dispatch, currentPage, statusFilter]);

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF and DOCX files are allowed');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const progressInterval = setInterval(() => {
        dispatch(setUploadProgress(Math.min(90, uploadProgress + 10)));
      }, 200);

      await dispatch(uploadFile(selectedFile)).unwrap();

      clearInterval(progressInterval);
      dispatch(setUploadProgress(100));

      setTimeout(() => {
        dispatch(setUploadProgress(0));
      }, 1000);

      setSelectedFile(null);
      dispatch(getUserFiles({ page: 1, limit: 10 }));
      setCurrentPage(1);
    } catch (err: any) {
      setUploadError(err);
      dispatch(setUploadProgress(0));
    }
  };

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await dispatch(deleteFile(fileId)).unwrap();
        dispatch(getUserFiles({ page: currentPage, limit: 10 }));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      setDownloadingFileId(fileId);
      const response = await apiService.getFileDownloadUrl(fileId);

      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setUploadError('Failed to download file');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleClearError = () => {
    setUploadError(null);
    dispatch(clearError());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100';
      case 'processing': return 'text-primary-600 bg-primary-100';
      case 'failed': return 'text-error-600 bg-error-100';
      case 'uploaded': return 'text-warning-600 bg-warning-100';
      default: return 'text-text-tertiary bg-bg-tertiary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'uploaded': return <FileIcon className="w-4 h-4" />;
      default: return <FileIcon className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Upload Files</h1>
          <p className="text-text-secondary">
            Upload your PDF or DOCX files to generate quizzes
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Drag and Drop Area */}
          <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="mb-6"
          >
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-border-primary hover:border-primary-400 hover:bg-bg-tertiary'
                }`}
            >
              <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-primary-600' : 'text-text-tertiary'}`} />
              <p className="text-lg font-semibold text-text-primary mb-2">
                {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-text-secondary mb-4">or</p>
              <label className="inline-block">
                <span className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 cursor-pointer transition-colors duration-200">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>
              <p className="text-xs text-text-tertiary mt-4">
                Supported formats: PDF, DOCX (Max size: 50MB)
              </p>
            </div>
          </form>

          {/* Selected File Display */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                className="bg-bg-tertiary rounded-lg p-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-semibold text-text-primary">{selectedFile.name}</p>
                      <p className="text-sm text-text-secondary">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-text-tertiary hover:text-error-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(uploadError || error) && (
            <motion.div
              className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{uploadError || error}</span>
              </div>
              <button
                onClick={handleClearError}
                className="text-error-700 hover:text-error-800"
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${selectedFile && !loading
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
              }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload File</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Files List Section */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6 border-b border-border-primary">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-text-primary">Your Files</h2>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-border-primary rounded-lg hover:bg-bg-tertiary text-text-primary"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showFilters && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full p-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading && files.length === 0 ? (
            <LoadingSpinner />
          ) : filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">
                {searchTerm || statusFilter !== 'all' ? 'No files match your search criteria' : 'No files uploaded yet'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2 text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-border-primary">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    className="p-6 hover:bg-bg-tertiary transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <FileText className="w-10 h-10 text-primary-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary truncate">{file.filename}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary flex-wrap">
                            <span>{formatFileSize(file.size)}</span>
                            {file.num_pages && <span>{file.num_pages} pages</span>}
                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            {file.mime_type && (
                              <span className="px-2 py-1 bg-bg-tertiary text-text-secondary rounded text-xs">
                                {file.mime_type.split('/')[1]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(file.status)}`}>
                          {getStatusIcon(file.status)}
                          {file.status}
                        </span>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(file.id, file.filename)}
                            disabled={downloadingFileId === file.id}
                            className="p-2 text-text-tertiary hover:text-primary-600 transition-colors disabled:opacity-50"
                            title="Download file"
                          >
                            {downloadingFileId === file.id ? (
                              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 text-text-tertiary hover:text-error-500 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-6 border-t border-border-primary flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    Showing {((currentPage - 1) * (pagination.limit || 10)) + 1} to{' '}
                    {Math.min(currentPage * (pagination.limit || 10), pagination.total)} of{' '}
                    {pagination.total} files
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-text-secondary mx-2">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UploadFile;