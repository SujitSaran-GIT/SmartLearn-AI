import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface OptionButtonProps {
  label: string;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ 
  label, 
  text, 
  isSelected, 
  isCorrect, 
  isWrong, 
  onClick,
  disabled = false
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ';
    
    if (disabled) {
      baseClasses += 'cursor-not-allowed opacity-75 ';
    } else {
      baseClasses += 'cursor-pointer hover:scale-[1.02] ';
    }

    if (isCorrect) {
      return baseClasses + 'bg-green-50 border-green-500 text-green-900 shadow-sm';
    } else if (isWrong) {
      return baseClasses + 'bg-red-50 border-red-500 text-red-900 shadow-sm';
    } else if (isSelected) {
      return baseClasses + 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm';
    } else {
      return baseClasses + 'bg-white border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-900';
    }
  };

  const getLabelClasses = () => {
    if (isCorrect) {
      return 'bg-green-500 text-white border-green-600';
    } else if (isWrong) {
      return 'bg-red-500 text-white border-red-600';
    } else if (isSelected) {
      return 'bg-indigo-500 text-white border-indigo-600';
    } else {
      return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={getButtonClasses()}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition ${getLabelClasses()}`}>
        {label}
      </div>
      <span className="flex-1 font-medium leading-relaxed">{text}</span>
      
      {(isCorrect || isWrong) && (
        <div className="flex-shrink-0">
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
      )}
    </button>
  );
};