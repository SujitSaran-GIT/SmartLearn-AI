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
  ArrowLeft,
  Hash,
  BarChart3,
  Zap
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
        navigate(`/quiz/${result.data.jobId}/take`);
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  if (!currentFile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <motion.div 
          className="text-center bg-bg-secondary rounded-xl shadow-lg p-8 border border-border-primary max-w-md w-full mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-error-600" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">File Not Found</h3>
          <p className="text-text-secondary mb-6">The requested file could not be loaded.</p>
          <button
            onClick={() => navigate('/upload')}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300"
          >
            Back to Upload
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-tertiary py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-6 mb-8 border border-border-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-bg-tertiary rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Files</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Generate Quiz</h1>
                  <p className="text-text-secondary">
                    From: <span className="font-semibold text-primary-600">{currentFile?.filename}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-bg-primary rounded-lg border border-border-primary">
              <FileText className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-secondary">Ready to generate</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Configuration Form Card */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-border-primary">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-primary">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Quiz Configuration</h2>
                  <p className="text-text-secondary text-sm">Customize your quiz parameters</p>
                </div>
              </div>

              <form onSubmit={handleGenerateQuiz}>
                <div className="space-y-6">
                  {/* Total Questions */}
                  <motion.div 
                    className="bg-bg-primary rounded-lg p-4 border border-border-primary hover:border-primary-200 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary-600" />
                      Total Questions
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      min="5"
                      max="50"
                      value={formData.totalQuestions}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-secondary text-text-primary transition-colors"
                      required
                    />
                    <p className="text-xs text-text-tertiary mt-2 flex items-center gap-1">
                      <span>Recommended: 10-20 questions for optimal experience</span>
                    </p>
                  </motion.div>

                  {/* Difficulty Level */}
                  <motion.div 
                    className="bg-bg-primary rounded-lg p-4 border border-border-primary hover:border-primary-200 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary-600" />
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-secondary text-text-primary transition-colors"
                    >
                      <option value="easy">Easy - Basic concepts and definitions</option>
                      <option value="medium">Medium - Applied knowledge</option>
                      <option value="hard">Hard - Complex analysis and synthesis</option>
                    </select>
                  </motion.div>

                  {/* Time Limit */}
                  <motion.div 
                    className="bg-bg-primary rounded-lg p-4 border border-border-primary hover:border-primary-200 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      name="timeLimit"
                      min="10"
                      max="180"
                      value={formData.timeLimit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-secondary text-text-primary transition-colors"
                      required
                    />
                    <p className="text-xs text-text-tertiary mt-2">
                      {formData.timeLimit >= 60 
                        ? `${Math.floor(formData.timeLimit / 60)} hour${Math.floor(formData.timeLimit / 60) > 1 ? 's' : ''} ${formData.timeLimit % 60 ? `and ${formData.timeLimit % 60} minutes` : ''}`
                        : `${formData.timeLimit} minutes`
                      }
                    </p>
                  </motion.div>

                  {/* Focus Areas */}
                  <motion.div 
                    className="bg-bg-primary rounded-lg p-4 border border-border-primary hover:border-primary-200 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                      Focus Areas (comma separated)
                    </label>
                    <textarea
                      name="focusAreas"
                      value={formData.focusAreas}
                      onChange={handleInputChange}
                      placeholder="e.g., Algebra, Geometry, Calculus, Statistics..."
                      rows={3}
                      className="w-full px-4 py-3 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-secondary text-text-primary transition-colors resize-none"
                    />
                    <p className="text-xs text-text-tertiary mt-2">
                      Leave empty to cover all topics from your document
                    </p>
                  </motion.div>
                </div>

                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="mt-6 p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-error-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* Generate Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Your Quiz...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      Generate & Start Exam
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Preview Panel Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-border-primary sticky top-8">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-primary">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Quiz Preview</h3>
                  <p className="text-text-secondary text-sm">Summary of your settings</p>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* File Info */}
                <motion.div 
                  className="flex items-center gap-4 p-4 bg-bg-primary rounded-lg border border-border-primary"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text-secondary mb-1">Source Document</p>
                    <p className="font-medium text-text-primary truncate">{currentFile?.filename}</p>
                  </div>
                </motion.div>

                {/* Questions Count */}
                <motion.div 
                  className="flex items-center gap-4 p-4 bg-bg-primary rounded-lg border border-border-primary"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Questions</p>
                    <p className="font-semibold text-text-primary text-lg">{formData.totalQuestions}</p>
                  </div>
                </motion.div>

                {/* Time Limit */}
                <motion.div 
                  className="flex items-center gap-4 p-4 bg-bg-primary rounded-lg border border-border-primary"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Time Limit</p>
                    <p className="font-semibold text-text-primary text-lg">{formData.timeLimit} min</p>
                  </div>
                </motion.div>

                {/* Difficulty */}
                <motion.div 
                  className="p-4 bg-bg-primary rounded-lg border border-border-primary"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <p className="text-sm text-text-secondary mb-3">Difficulty Level</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                      formData.difficulty === 'easy' 
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
                        : formData.difficulty === 'medium'
                        ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                        : 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                    }`}>
                      {formData.difficulty}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary">
                        {formData.difficulty === 'easy' && 'Basic concepts'}
                        {formData.difficulty === 'medium' && 'Applied knowledge'}
                        {formData.difficulty === 'hard' && 'Complex analysis'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Focus Areas */}
                {formData.focusAreas && (
                  <motion.div 
                    className="p-4 bg-bg-primary rounded-lg border border-border-primary"
                    whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-sm text-text-secondary mb-3">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.focusAreas.split(',').map((area, index) => (
                        area.trim() && (
                          <motion.span 
                            key={index} 
                            className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 text-sm rounded-full font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            {area.trim()}
                          </motion.span>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Estimated Time */}
                <div className="pt-4 border-t border-border-primary">
                  <div className="text-center">
                    <p className="text-text-secondary text-sm mb-2">Estimated Completion</p>
                    <p className="text-lg font-semibold text-text-primary">
                      ~{Math.ceil(formData.totalQuestions * 1.5)} minutes
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Based on {formData.totalQuestions} questions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneration;