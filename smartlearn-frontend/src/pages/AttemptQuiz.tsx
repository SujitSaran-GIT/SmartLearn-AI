import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import {
  getUserFiles,
  deleteFile,
  clearError
} from '../redux/slices/fileSlice';
import {
  FileText,
  Trash2,
  PlayCircle,
  Search,
  Filter,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AttemptQuiz: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { files, loading, error, pagination } = useSelector((state: RootState) => state.files);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params: any = { page: currentPage, limit: 10 };
    if (statusFilter !== 'all') params.status = statusFilter;

    dispatch(getUserFiles(params));
  }, [dispatch, currentPage, statusFilter]);

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await dispatch(deleteFile(fileId)).unwrap();
        dispatch(getUserFiles({ page: currentPage, limit: 10, status: statusFilter !== 'all' ? statusFilter : undefined }));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleGenerateQuiz = (fileId: string) => {
    navigate(`/generate-quiz/${fileId}`);
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Attempt Quiz</h1>
          <p className="text-text-secondary">
            Select a file to generate and attempt a quiz
          </p>
        </motion.div>

        {/* Files List Section */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

          {/* Error Display */}
          {error && (
            <motion.div
              className="mx-6 mt-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleClearError}
                className="text-error-700 hover:text-error-800"
              >
                ×
              </button>
            </motion.div>
          )}

          {loading && files.length === 0 ? (
            <LoadingSpinner />
          ) : filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">
                {searchTerm || statusFilter !== 'uploaded' ? 'No files match your search criteria' : 'No files uploaded yet'}
              </p>
              {(searchTerm || statusFilter !== 'uploaded') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('uploaded');
                  }}
                  className="mt-2 text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Upload Files
              </button>
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
                        {/* Generate Quiz Button */}
                        {file.status === 'uploaded' && (
                          <button
                            onClick={() => handleGenerateQuiz(file.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Generate Quiz
                          </button>
                        )}

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

export default AttemptQuiz;