import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  Flag,
  ArrowLeft,
  ArrowRight,
  Send
} from 'lucide-react';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getJobStatus } from '../redux/slices/mcqSlice';
import { submitQuiz } from '../redux/slices/quizSlice';

interface Answer {
  questionId: string;
  selectedOption: number;
  flagged: boolean;
}

const ExamScreen: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentQuiz, loading, error } = useSelector((state: RootState) => state.quiz);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [jobStatus, setJobStatus] = useState<{
    status: string;
    progress: number;
    quizId?: string;
  } | null>(null);

  // Poll job status and load quiz when ready
  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const result = await dispatch(getJobStatus(jobId)).unwrap();
        setJobStatus({
          status: result.data.status,
          progress: result.data.progress,
          quizId: result.data.quizId
        });

        if (result.data.status === 'completed' && result.data.quizId) {
          await dispatch({ type: 'quiz/getQuiz', payload: result.data.quizId });
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (result.data.status === 'failed') {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, dispatch]);

  // Set time limit when quiz loads
  useEffect(() => {
    if (currentQuiz && currentQuiz.questions) {
      setTimeLeft(30 * 60);
      setExamStarted(true);
      
      const initialAnswers = currentQuiz.questions.map((question) => ({
        questionId: question.id,
        selectedOption: -1,
        flagged: false
      }));
      setAnswers(initialAnswers);
    }
  }, [currentQuiz]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const handleAutoSubmit = useCallback(async () => {
    if (currentQuiz) {
      try {
        const formattedAnswers = answers
          .filter(a => a.selectedOption !== -1)
          .map(a => ({
            questionId: a.questionId,
            selectedIndex: a.selectedOption
          }));

        await dispatch(submitQuiz({
          quizId: currentQuiz.id,
          answers: formattedAnswers
        })).unwrap();

        navigate(`/results/${currentQuiz.id}`);
      } catch (error) {
        console.error('Auto-submit failed:', error);
      }
    }
  }, [currentQuiz, answers, dispatch, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestionIndex 
        ? { ...answer, selectedOption: optionIndex }
        : answer
    ));
  };

  const handleFlagQuestion = () => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestionIndex 
        ? { ...answer, flagged: !answer.flagged }
        : answer
    ));
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitExam = async () => {
    if (window.confirm('Are you sure you want to submit your exam? You cannot change answers after submission.')) {
      if (currentQuiz) {
        try {
          const formattedAnswers = answers
            .filter(a => a.selectedOption !== -1)
            .map(a => ({
              questionId: a.questionId,
              selectedIndex: a.selectedOption
            }));

          await dispatch(submitQuiz({
            quizId: currentQuiz.id,
            answers: formattedAnswers
          })).unwrap();

          navigate(`/results/${currentQuiz.id}`);
        } catch (error) {
          console.error('Submission failed:', error);
        }
      }
    }
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-text-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary text-lg">Loading Exam...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center text-text-primary">
          <p className="text-lg mb-4">Failed to load exam</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 text-white"
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Exam Header */}
      <div className="bg-bg-secondary border-b border-border-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-semibold text-white">
              {user?.id || 'STD'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name || 'Student'}</h1>
              <p className="text-text-secondary text-sm">Roll No: {user?.id || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className={`flex items-center gap-2 text-lg font-mono ${
              timeLeft < 300 ? 'text-error-400 animate-pulse' : 'text-text-primary'
            }`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitExam}
              className="flex items-center gap-2 px-4 py-2 bg-success-600 rounded-lg hover:bg-success-700 transition-colors text-white"
            >
              <Send className="w-4 h-4" />
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Questions Navigation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {currentQuiz.questions.map((_, index) => {
                  const answer = answers[index];
                  const isAnswered = answer?.selectedOption !== -1;
                  const isFlagged = answer?.flagged;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionSelect(index)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative ${
                        isCurrent
                          ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                          : isAnswered
                          ? 'bg-success-600 text-white'
                          : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
                      } ${isFlagged ? 'ring-2 ring-warning-400' : ''}`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="w-3 h-3 absolute -top-1 -right-1 text-warning-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success-600 rounded"></div>
                  <span className="text-sm text-text-secondary">Answered</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-bg-tertiary rounded"></div>
                  <span className="text-sm text-text-secondary">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-3 h-3 text-warning-400" />
                  <span className="text-sm text-text-secondary">Flagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-bg-secondary rounded-lg p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary-600 rounded-full text-sm font-semibold text-white">
                    Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                  </span>
                  {currentAnswer?.flagged && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-warning-600 rounded-full text-sm text-white">
                      <Flag className="w-3 h-3" />
                      Flagged
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlagQuestion}
                    className={`p-2 rounded-lg transition-colors ${
                      currentAnswer?.flagged
                        ? 'bg-warning-600 text-white'
                        : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-quaternary'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-6 leading-relaxed text-text-primary">
                  {currentQuestion?.questionText}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                  {currentQuestion?.options.map((option, optionIndex) => (
                    <motion.button
                      key={optionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: optionIndex * 0.1 }}
                      onClick={() => handleAnswerSelect(optionIndex)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        currentAnswer?.selectedOption === optionIndex
                          ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                          : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currentAnswer?.selectedOption === optionIndex
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-border-secondary'
                        }`}>
                          {currentAnswer?.selectedOption === optionIndex && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="flex-1 text-text-primary">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-border-primary">
                <button
                  onClick={() => handleNavigation('prev')}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-bg-tertiary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-primary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={() => handleNavigation('next')}
                  disabled={currentQuestionIndex === currentQuiz.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamScreen;