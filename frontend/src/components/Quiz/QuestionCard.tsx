import React from 'react';
import { OptionButton } from './OptionButton';
import { BookOpen, Lightbulb, Clock } from 'lucide-react';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption?: number;
  onSelectOption: (optionIndex: number) => void;
  showCorrectAnswer?: boolean;
  timeSpent?: number;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  questionNumber, 
  totalQuestions,
  selectedOption, 
  onSelectOption,
  showCorrectAnswer = false,
  timeSpent = 0,
  disabled = false
}) => {
  const isAnswered = selectedOption !== undefined;
  const isCorrect = showCorrectAnswer && selectedOption === question.correctOptionIndex;
  const isWrong = showCorrectAnswer && selectedOption !== undefined && selectedOption !== question.correctOptionIndex;

  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Q{questionNumber}
            </span>
            <span className="text-sm text-gray-600">
              {questionNumber} of {totalQuestions}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {timeSpent > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Time: {formatTimeSpent(timeSpent)}</span>
              </div>
            )}
            
            {isAnswered && !showCorrectAnswer && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-green-600 font-medium">Answered</span>
              </div>
            )}
            
            {showCorrectAnswer && (
              <div className={`flex items-center space-x-1 ${
                isCorrect ? 'text-green-600' : isWrong ? 'text-red-600' : 'text-gray-600'
              }`}>
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">
                  {isCorrect ? 'Correct!' : isWrong ? 'Incorrect' : 'Not Answered'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
          {question.question}
        </h2>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              label={String.fromCharCode(65 + index)}
              text={option}
              isSelected={selectedOption === index}
              isCorrect={showCorrectAnswer && question.correctOptionIndex === index}
              isWrong={showCorrectAnswer && selectedOption === index && question.correctOptionIndex !== index}
              onClick={() => onSelectOption(index)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Question Metadata */}
        {question.sourceSnippet && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Source Reference</span>
            </div>
            <p className="text-sm text-blue-700 italic leading-relaxed">
              "{question.sourceSnippet}"
            </p>
          </div>
        )}

        {/* Explanation (shown in review mode) */}
        {showCorrectAnswer && question.explanation && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Explanation</span>
            </div>
            <p className="text-sm text-green-700 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Answer Statistics (could be added later) */}
        {showCorrectAnswer && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Correct Answer: {String.fromCharCode(65 + question.correctOptionIndex)}</span>
            <span>Your Answer: {selectedOption !== undefined ? String.fromCharCode(65 + selectedOption) : 'Not answered'}</span>
          </div>
        )}
      </div>
    </div>
  );
};