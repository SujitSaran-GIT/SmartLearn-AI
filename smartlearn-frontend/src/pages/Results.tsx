import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getQuizResults } from '../redux/slices/quizSlice';
import { Trophy, CheckCircle, XCircle, Clock, Target, TrendingUp, RotateCcw, Home, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Results: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const { currentQuiz, attempts, loading, error } = useSelector((state: RootState) => state.quiz);

  useEffect(() => {
    if (quizId) {
      dispatch(getQuizResults(quizId));
    }
  }, [dispatch, quizId]);

  const isLoading = loading || (!currentQuiz && !attempts);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Error Loading Results</h2>
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

  const hasAttempts = attempts && attempts.length > 0;
  
  if (!hasAttempts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <Target className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">No Attempts Found</h2>
          <p className="text-text-secondary mb-4">You haven't taken this quiz yet.</p>
          <button
            onClick={() => navigate(`/quiz/${quizId}/take`)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mr-4"
          >
            Take Quiz Now
          </button>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const latestAttempt = attempts[0];
  const quizTitle = currentQuiz?.title || 'Quiz Results';
  const percentage = (latestAttempt.score / latestAttempt.total_count) * 10;
  console.log("Percentage: ", percentage)
  const isPassed = percentage >= 30;

  return (
    <div className="min-h-screen bg-bg-tertiary py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            {isPassed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Trophy className="w-20 h-20 text-warning-500 mx-auto mb-4" />
              </motion.div>
            ) : (
              <Target className="w-20 h-20 text-text-tertiary mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {isPassed ? 'Congratulations!' : 'Quiz Completed'}
            </h1>
            <p className="text-text-secondary mb-6">{quizTitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-success-200 to-success-100 rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-success-700">{latestAttempt.correct_count}</div>
                <div className="text-sm text-success-600 font-medium">Correct</div>
              </div>
              
              <div className="bg-gradient-to-br from-error-200 to-error-100 rounded-xl p-6">
                <XCircle className="w-8 h-8 text-error-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-error-700">{latestAttempt.wrong_count}</div>
                <div className="text-sm text-error-600 font-medium">Wrong</div>
              </div>
              
              <div className="bg-gradient-to-br from-primary-200 to-primary-100 rounded-xl p-6">
                <Target className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary-700">{latestAttempt.total_count}</div>
                <div className="text-sm text-primary-600 font-medium">Total</div>
              </div>
              
              <div className={`bg-gradient-to-br rounded-xl p-6 ${
                isPassed 
                  ? 'from-purple-400 to-purple-300' 
                  : 'from-bg-tertiary to-bg-quaternary'
              }`}>
                <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                  isPassed ? 'text-purple-600' : 'text-text-tertiary'
                }`} />
                <div className={`text-3xl font-bold ${
                  isPassed ? 'text-purple-700' : 'text-text-primary'
                }`}>
                  {latestAttempt.score}%
                </div>
                <div className={`text-sm font-medium ${
                  isPassed ? 'text-purple-600' : 'text-text-secondary'
                }`}>
                  Score
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Analysis */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Performance Analysis</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-text-primary">Overall Performance</span>
              <span className="text-sm font-semibold text-text-primary">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-4 overflow-hidden">
              <motion.div
                className={`h-4 rounded-full ${
                  percentage >= 90 ? 'bg-success-600' :
                  percentage >= 70 ? 'bg-primary-600' :
                  percentage >= 50 ? 'bg-warning-600' : 'bg-error-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-border-primary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">Accuracy Rate</div>
              <div className="text-2xl font-bold text-text-primary">
                {((latestAttempt.correct_count / latestAttempt.total_count) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="border-2 border-border-primary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">Pass Status</div>
              <div className={`text-2xl font-bold ${isPassed ? 'text-success-600' : 'text-error-600'}`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
            
            <div className="border-2 border-border-primary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">Submitted At</div>
              <div className="text-lg font-bold text-text-primary">
                {new Date(latestAttempt.submitted_at).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question-by-Question Review */}
        {latestAttempt.answers && latestAttempt.answers.length > 0 && (
          <motion.div
            className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Detailed Review</h2>
            
            <div className="space-y-6">
              {latestAttempt.answers.map((answer, index) => {
                const question = answer.question;
                if (!question) return null;
                
                return (
                  <motion.div
                    key={answer.id}
                    className="border-2 border-border-primary rounded-xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        answer.is_correct 
                          ? 'bg-success-100 text-success-600' 
                          : 'bg-error-100 text-error-600'
                      }`}>
                        {answer.is_correct ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <XCircle className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-text-tertiary">Question {index + 1}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            answer.is_correct 
                              ? 'bg-success-100 text-success-700' 
                              : 'bg-error-100 text-error-700'
                          }`}>
                            {answer.is_correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text-primary mb-4">
                          {question.question_text}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optIndex) => {
                            const isCorrect = optIndex === question.correct_index;
                            const isSelected = optIndex === answer.selected_index;
                            
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrect && isSelected
                                    ? 'border-success-500 bg-success-50'
                                    : isCorrect
                                      ? 'border-success-500 bg-success-50'
                                      : isSelected
                                        ? 'border-error-500 bg-error-50'
                                        : 'border-border-primary bg-bg-tertiary'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrect && <CheckCircle className="w-5 h-5 text-success-600" />}
                                  {!isCorrect && isSelected && <XCircle className="w-5 h-5 text-error-600" />}
                                  <span className={`flex-1 ${
                                    isCorrect ? 'font-semibold text-success-900' :
                                    isSelected ? 'font-semibold text-error-900' : 'text-text-primary'
                                  }`}>
                                    {option}
                                  </span>
                                  {isCorrect && (
                                    <span className="text-xs font-semibold text-success-600">Correct Answer</span>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <span className="text-xs font-semibold text-error-600">Your Answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-5 h-5 text-primary-600" />
                              <span className="font-semibold text-primary-900">Explanation</span>
                            </div>
                            <p className="text-primary-800">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-quaternary transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate(`/quiz/${quizId}/take`)}
            className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </button>
          
          <button
            onClick={() => navigate('/quizzes')}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            View All Quizzes
          </button>
        </motion.div>

        {/* Attempt History */}
        {attempts.length > 1 && (
          <motion.div
            className="bg-bg-secondary rounded-xl shadow-lg p-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Attempt History</h2>
            
            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      #{attempts.length - index}
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">
                        {new Date(attempt.submitted_at).toLocaleString()}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {attempt.correct_count} / {attempt.total_count} correct
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      attempt.score >= 70 ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {attempt.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Results;