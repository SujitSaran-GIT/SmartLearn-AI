import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getQuiz, submitQuiz, clearCurrentQuiz } from '../redux/slices/quizSlice';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TakeQuiz: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  
  const { currentQuiz, loading, error } = useSelector((state: RootState) => state.quiz);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (quizId) {
      dispatch(getQuiz(quizId));
    }

    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, quizId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    if (!currentQuiz || !quizId) return;

    const unansweredCount = currentQuiz.questions!.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const submission = {
        answers: currentQuiz.questions!.map(q => ({
          questionId: q.id,
          selectedIndex: answers[q.id] ?? -1
        }))
      };

      await dispatch(submitQuiz({ quizId, submission })).unwrap();
      navigate(`/results/${quizId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      setIsSubmitting(false);
    }
  };

  if (loading || !currentQuiz) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Error Loading Quiz</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-text-secondary mb-4">No questions available for this quiz</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-bg-tertiary py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{currentQuiz.title}</h1>
              <p className="text-sm text-text-secondary mt-1">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-text-primary">
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>Answered: {answeredCount} / {currentQuiz.questions.length}</span>
            <span>Flagged: {flaggedQuestions.size}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                className="bg-bg-secondary rounded-xl shadow-lg p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        Question {currentQuestionIndex + 1}
                      </span>
                      {currentQuestion.difficulty && (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          currentQuestion.difficulty === 'easy' ? 'bg-success-100 text-success-700' :
                          currentQuestion.difficulty === 'medium' ? 'bg-warning-100 text-warning-700' :
                          'bg-error-100 text-error-700'
                        }`}>
                          {currentQuestion.difficulty}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary leading-relaxed">
                      {currentQuestion.questionText}
                    </h2>
                  </div>
                  
                  <button
                    onClick={handleToggleFlag}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'bg-warning-100 text-warning-600'
                        : 'bg-bg-tertiary text-text-tertiary hover:text-warning-600'
                    }`}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50 shadow-md'
                            : 'border-border-primary hover:border-primary-300 hover:bg-bg-tertiary'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600'
                              : 'border-border-secondary'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`flex-1 ${isSelected ? 'font-semibold text-text-primary' : 'text-text-primary'}`}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-primary">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmDialog(true)}
                      className="px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center gap-2 font-semibold"
                    >
                      <Send className="w-5 h-5" />
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-semibold"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-text-primary mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {currentQuiz.questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.has(index);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all relative ${
                        isCurrent
                          ? 'bg-primary-600 text-white shadow-md'
                          : isAnswered
                            ? 'bg-success-100 text-success-700 hover:bg-success-200'
                            : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="w-3 h-3 absolute top-0.5 right-0.5 text-warning-500" fill="currentColor" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary-600 rounded"></div>
                  <span className="text-text-secondary">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success-100 rounded"></div>
                  <span className="text-text-secondary">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-bg-tertiary rounded"></div>
                  <span className="text-text-secondary">Not Answered</span>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full mt-6 px-4 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              className="bg-bg-secondary rounded-xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-text-primary mb-4">Submit Quiz?</h3>
              <p className="text-text-secondary mb-2">
                You have answered {answeredCount} out of {currentQuiz.questions.length} questions.
              </p>
              {answeredCount < currentQuiz.questions.length && (
                <p className="text-warning-600 mb-4 font-semibold">
                  {currentQuiz.questions.length - answeredCount} question(s) remain unanswered.
                </p>
              )}
              <p className="text-text-secondary mb-6">
                Are you sure you want to submit? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-3 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary transition-colors font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TakeQuiz;