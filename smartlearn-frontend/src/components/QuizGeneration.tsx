import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Settings, 
  PlayCircle, 
  Clock, 
  Target,
  ArrowLeft
} from 'lucide-react';
import { generateMCQ } from '../redux/slices/mcqSlice';
import { getFile } from '../redux/slices/fileSlice';
import LoadingSpinner from './common/LoadingSpinner';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';

const QuizGeneration: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentFile } = useSelector((state: RootState) => state.files);
  const { loading, error, jobId } = useSelector((state: RootState) => state.mcq);
  
  const [formData, setFormData] = useState({
    totalQuestions: 10,
    difficulty: 'medium',
    focusAreas: '',
    timeLimit: 30
  });

  useEffect(() => {
    if (fileId) {
      dispatch(getFile(fileId));
    }
  }, [fileId, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalQuestions' || name === 'timeLimit' ? parseInt(value) : value
    }));
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileId) return;

    try {
      const mcqData = {
        fileId,
        questionCount: formData.totalQuestions,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        focusAreas: formData.focusAreas.split(',').map(area => area.trim()).filter(area => area)
      };

      const result = await dispatch(generateMCQ(mcqData)).unwrap();
      
      if (result.data?.jobId) {
        navigate(`/exam/${result.data.jobId}`);
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  if (!currentFile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">File not found</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-tertiary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Files
          </button>
          
          <h1 className="text-3xl font-bold text-text-primary mb-2">Generate Quiz</h1>
          <p className="text-text-secondary">
            Configure your quiz settings for: <strong>{currentFile?.filename}</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleGenerateQuiz} className="bg-bg-secondary rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quiz Configuration
                </h2>
              </div>

              {/* Total Questions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Total Questions
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  min="5"
                  max="50"
                  value={formData.totalQuestions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                  required
                />
                <p className="text-xs text-text-tertiary mt-1">Between 5-50 questions</p>
              </div>

              {/* Difficulty Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Time Limit */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  min="10"
                  max="180"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                  required
                />
              </div>

              {/* Focus Areas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Focus Areas (comma separated)
                </label>
                <textarea
                  name="focusAreas"
                  value={formData.focusAreas}
                  onChange={handleInputChange}
                  placeholder="e.g., Algebra, Geometry, Calculus"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-primary text-text-primary"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Specify specific topics you want to focus on
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    Generate & Start Exam
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-bg-secondary rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quiz Preview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-text-secondary">File</p>
                    <p className="font-medium text-text-primary truncate">{currentFile?.filename}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-success-600" />
                  <div>
                    <p className="text-sm text-text-secondary">Questions</p>
                    <p className="font-medium text-text-primary">{formData.totalQuestions} questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning-600" />
                  <div>
                    <p className="text-sm text-text-secondary">Time Limit</p>
                    <p className="font-medium text-text-primary">{formData.timeLimit} minutes</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-primary">
                  <p className="text-sm text-text-secondary mb-2">Difficulty</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    formData.difficulty === 'easy' 
                      ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
                      : formData.difficulty === 'medium'
                      ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                      : 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                  }`}>
                    {formData.difficulty}
                  </span>
                </div>

                {formData.focusAreas && (
                  <div className="pt-4 border-t border-border-primary">
                    <p className="text-sm text-text-secondary mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.focusAreas.split(',').map((area, index) => (
                        area.trim() && (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 text-xs rounded">
                            {area.trim()}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneration;