import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  isLastQuestion: boolean;
  className?: string;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  canGoNext,
  isLastQuestion,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg flex items-center justify-between ${className}`}>
      <button 
        onClick={onPrevious} 
        disabled={currentQuestion === 0}
        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Previous</span>
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition ${
                idx === currentQuestion 
                  ? 'bg-indigo-600' 
                  : idx < currentQuestion 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {isLastQuestion ? (
        <button 
          onClick={onSubmit}
          disabled={!canGoNext}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          <span>Submit Quiz</span>
          <CheckCircle2 className="w-5 h-5" />
        </button>
      ) : (
        <button 
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          <span>Next Question</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};