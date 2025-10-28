import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getUserQuizzes, deleteQuiz } from '../redux/slices/quizSlice';
import { BookOpen, Play, Trash2, Calendar, FileText, Target, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Quizzes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizzes, loading, error, pagination } = useSelector((state: RootState) => state.quiz);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    dispatch(getUserQuizzes({ 
      page: currentPage, 
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter
    }));
  }, [dispatch, currentPage, statusFilter]);

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await dispatch(deleteQuiz(quizId)).unwrap();
        dispatch(getUserQuizzes({ page: currentPage, limit: 10 }));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}/take`);
  };

  const handleViewResults = (quizId: string) => {
    navigate(`/results/${quizId}`);
  };

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">My Quizzes</h1>
            <p className="text-text-secondary">
              Manage and take your quizzes
            </p>
          </div>
          
          <button
            onClick={() => navigate('/generate')}
            className="mt-4 md:mt-0 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Create New Quiz
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-md p-4 mb-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-sm font-semibold text-text-primary">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quizzes List */}
        {loading && quizzes.length === 0 ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error-500 mb-4">{error}</p>
            <button
              onClick={() => dispatch(getUserQuizzes({ page: currentPage, limit: 10 }))}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div
            className="bg-bg-secondary rounded-xl shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No quizzes found</h3>
            <p className="text-text-secondary mb-6">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} quizzes available` 
                : 'Start by creating your first quiz'}
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Create Your First Quiz
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  className="bg-bg-secondary rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{quiz.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            quiz.status === 'active' 
                              ? 'bg-success-100 text-success-700' 
                              : 'bg-bg-tertiary text-text-secondary'
                          }`}>
                            {quiz.status}
                          </span>
                        </div>
                        
                        {quiz.file && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                            <FileText className="w-4 h-4" />
                            <span>{quiz.file.filename}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="p-2 text-text-tertiary hover:text-error-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Target className="w-5 h-5 text-primary-600" />
                        <span className="text-sm">
                          <span className="font-semibold">{quiz.question_count}</span> Questions
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-text-primary">
                        <TrendingUp className="w-5 h-5 text-success-600" />
                        <span className="text-sm">
                          <span className="font-semibold">{quiz._count?.attempts || 0}</span> Attempts
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-text-primary">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-sm">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleTakeQuiz(quiz.id)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Take Quiz
                      </button>
                      
                      {(quiz._count?.attempts || 0) > 0 && (
                        <button
                          onClick={() => handleViewResults(quiz.id)}
                          className="flex-1 px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-5 h-5" />
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                className="mt-8 bg-bg-secondary rounded-xl shadow-md p-6 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 
                      ? i + 1 
                      : currentPage >= pagination.totalPages - 2
                        ? pagination.totalPages - 4 + i
                        : currentPage - 2 + i;
                    
                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Quizzes;