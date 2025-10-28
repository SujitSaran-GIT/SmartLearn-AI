import React, { useState, useEffect } from 'react';

import { useQuiz } from '../../hooks/useQuiz';
import { LoadingSpinner } from '../../components/Shared/LoadingSpinner';
import type { PageType } from '../../types';
import { QuizNavigation } from '../../components/Quiz/QuizNavigation';
import { DashboardLayout } from '../../components/Shared/DashboardLayout';
import { QuestionCard } from '../../components/Quiz/QuestionCard';
import { QuizTimer } from '../../components/Quiz/QuizTImer';

interface QuizPageProps {
  onNavigate: (page: PageType, params?: any) => void;
  quizId: string;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onNavigate, quizId }) => {
  const [timeUp, setTimeUp] = useState(false);
  const {
    questions,
    currentQuestionIndex,
    answers,
    loading,
    error,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    currentQuestion,
    isLastQuestion,
    isFirstQuestion,
    totalQuestions
  } = useQuiz();

  useEffect(() => {
    // In a real app, we would load the quiz questions here
    // For now, we'll use mock data
  }, [quizId]);

  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const result = await submitQuiz(quizId);
      onNavigate('results', { resultId: result.resultId, score: result.score });
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading && questions.length === 0) {
    return (
      <DashboardLayout currentPage="quiz" onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Loading Quiz...</h3>
            <p className="text-gray-600">Preparing your questions</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && questions.length === 0) {
    return (
      <DashboardLayout currentPage="quiz" onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
              <h3 className="font-semibold mb-2">Failed to Load Quiz</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <DashboardLayout currentPage="quiz" onNavigate={onNavigate}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">No Questions Available</h3>
            <p className="text-gray-600">Please generate a quiz first</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="quiz" onNavigate={onNavigate}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              selectedOption={answers[currentQuestion.id]}
              onSelectOption={(optionIndex) => selectAnswer(currentQuestion.id, optionIndex)}
            />
            
            <QuizNavigation
              currentQuestion={currentQuestionIndex}
              totalQuestions={totalQuestions}
              onPrevious={prevQuestion}
              onNext={nextQuestion}
              onSubmit={handleSubmit}
              canGoNext={answers[currentQuestion.id] !== undefined}
              isLastQuestion={isLastQuestion}
            />
          </div>

          <div className="space-y-6">
            <QuizTimer
              duration={Math.ceil(totalQuestions * 1.5)} 
              onTimeUp={handleTimeUp}
              isPaused={timeUp}
            />
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Question Overview</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                      index === currentQuestionIndex
                        ? 'bg-indigo-600 text-white'
                        : answers[questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Unanswered</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Quiz Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Answered</span>
                  <span className="font-medium text-gray-800">
                    {Object.keys(answers).length} / {totalQuestions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium text-gray-800">
                    {totalQuestions - Object.keys(answers).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};