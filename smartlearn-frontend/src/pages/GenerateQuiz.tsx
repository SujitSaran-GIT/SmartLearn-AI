import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getUserFiles } from '../redux/slices/fileSlice';
import { generateMCQ, pollJobStatus, clearCurrentJob } from '../redux/slices/mcqSlice';
import { Brain, FileText, Zap, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GenerateQuiz: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { files, loading: filesLoading } = useSelector((state: RootState) => state.files);
  const { currentJob, loading: mcqLoading } = useSelector((state: RootState) => state.mcq);
  
  const [selectedFileId, setSelectedFileId] = useState<string>(searchParams.get('fileId') || '');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [focusAreas, setFocusAreas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    dispatch(getUserFiles({ status: 'completed' }));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch]);

  const completedFiles = files.filter(file => file.status === 'completed');

  const handleGenerate = async () => {
    if (!selectedFileId) {
      setError('Please select a file');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await dispatch(generateMCQ({
        fileId: selectedFileId,
        questionCount,
        difficulty,
        focusAreas: focusAreas ? focusAreas.split(',').map(area => area.trim()).filter(Boolean) : undefined
      })).unwrap();

      const jobResult = await dispatch(pollJobStatus(result.jobId)).unwrap();
      
      if (jobResult.status === 'completed' && jobResult.quizId) {
        navigate(`/quiz/${jobResult.quizId}`);
      } else if (jobResult.status === 'failed') {
        setError(jobResult.error || 'Quiz generation failed');
        setIsGenerating(false);
      }
    } catch (err: any) {
      setError(err || 'Failed to generate quiz');
      setIsGenerating(false);
    }
  };

  const getProgressPercentage = () => {
    if (!currentJob) return 0;
    return currentJob.progress || 0;
  };

  const getProgressStatus = () => {
    if (!currentJob) return null;
    
    switch (currentJob.status) {
      case 'pending':
        return { icon: <Clock className="w-5 h-5" />, text: 'Queued', color: 'text-warning-600' };
      case 'processing':
        return { icon: <Brain className="w-5 h-5 animate-pulse" />, text: 'Generating...', color: 'text-primary-600' };
      case 'completed':
        return { icon: <CheckCircle className="w-5 h-5" />, text: 'Completed', color: 'text-success-600' };
      case 'failed':
        return { icon: <AlertCircle className="w-5 h-5" />, text: 'Failed', color: 'text-error-600' };
      default:
        return null;
    }
  };

  const progressStatus = getProgressStatus();

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Generate Quiz</h1>
          <p className="text-text-secondary">
            Create AI-powered quizzes from your uploaded documents
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filesLoading ? (
            <LoadingSpinner />
          ) : completedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No completed files available</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Upload Files
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Select Document
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border-primary rounded-lg focus:border-primary-500 focus:outline-none transition-colors bg-bg-primary text-text-primary"
                  disabled={isGenerating}
                >
                  <option value="">Choose a document...</option>
                  {completedFiles.map(file => (
                    <option key={file.id} value={file.id}>
                      {file.filename} ({file.num_pages} pages)
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary-600"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      disabled={isGenerating}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        difficulty === level
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Areas (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Focus Areas (Optional)
                </label>
                <input
                  type="text"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  placeholder="e.g., Introduction, Chapter 1, Conclusion (comma-separated)"
                  className="w-full px-4 py-3 border-2 border-border-primary rounded-lg focus:border-primary-500 focus:outline-none transition-colors bg-bg-primary text-text-primary"
                  disabled={isGenerating}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Specify topics or sections to focus on, separated by commas
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Progress Display */}
              {isGenerating && currentJob && (
                <motion.div
                  className="bg-primary-50 border border-primary-200 rounded-lg p-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {progressStatus && (
                      <>
                        <div className={progressStatus.color}>{progressStatus.icon}</div>
                        <span className={`font-semibold ${progressStatus.color}`}>
                          {progressStatus.text}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="w-full bg-primary-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-primary-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-primary-700 mt-2">
                    <span>Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>

                  {currentJob.status === 'processing' && (
                    <p className="text-sm text-primary-600 mt-3">
                      This may take a few minutes. You can safely leave this page and come back later.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!selectedFileId || isGenerating}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  selectedFileId && !isGenerating
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                }`}
                whileHover={selectedFileId && !isGenerating ? { scale: 1.02 } : {}}
                whileTap={selectedFileId && !isGenerating ? { scale: 0.98 } : {}}
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    <span>Generate Quiz</span>
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <InfoCard
            icon={<Brain className="w-8 h-8 text-primary-600" />}
            title="AI-Powered"
            description="Advanced AI generates contextual questions from your documents"
          />
          <InfoCard
            icon={<Zap className="w-8 h-8 text-purple-600" />}
            title="Fast Generation"
            description="Get your quiz ready in minutes, not hours"
          />
          <InfoCard
            icon={<CheckCircle className="w-8 h-8 text-success-600" />}
            title="Quality Content"
            description="High-quality questions with detailed explanations"
          />
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description }) => (
  <motion.div
    className="bg-bg-secondary rounded-xl shadow-md p-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-center mb-3">{icon}</div>
    <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary">{description}</p>
  </motion.div>
);

export default GenerateQuiz;