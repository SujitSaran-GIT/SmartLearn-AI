import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuizTimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
  onTimeUpdate?: (timeLeft: number) => void;
  isPaused?: boolean;
  showWarning?: boolean;
  className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ 
  duration, 
  onTimeUp, 
  onTimeUpdate,
  isPaused = false,
  showWarning = true,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  const totalTime = duration * 60;
  const percentage = (timeLeft / totalTime) * 100;

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Update warning states
        if (showWarning) {
          setIsWarning(newTime <= 300 && newTime > 60); // 5 minutes to 1 minute
          setIsCritical(newTime <= 60); // Less than 1 minute
        }
        
        // Call update callback
        onTimeUpdate?.(newTime);
        
        // Handle time up
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, onTimeUp, onTimeUpdate, showWarning]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isCritical) return 'text-red-600 bg-red-100 border-red-200';
    if (isWarning) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (timeLeft <= 0) return 'text-gray-600 bg-gray-100 border-gray-200';
    return 'text-indigo-600 bg-indigo-100 border-indigo-200';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-orange-500';
    return 'bg-indigo-500';
  };

  const getStatusIcon = () => {
    if (timeLeft <= 0) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (isCritical) {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <Clock className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (timeLeft <= 0) return 'Time Up!';
    if (isCritical) return 'Hurry!';
    if (isWarning) return 'Almost there';
    return 'Time Remaining';
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-lg border-2 ${getTimerColor()} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-semibold">{getStatusText()}</span>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-xs opacity-75">mm:ss</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Time Statistics */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>Elapsed: {formatTime(totalTime - timeLeft)}</span>
        <span>Total: {formatTime(totalTime)}</span>
      </div>

      {/* Warning Messages */}
      {isCritical && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 text-center font-medium">
            Less than 1 minute remaining!
          </p>
        </div>
      )}
      
      {isWarning && !isCritical && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700 text-center">
            Less than 5 minutes remaining
          </p>
        </div>
      )}

      {/* Paused State */}
      {isPaused && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center font-medium">
            Timer Paused
          </p>
        </div>
      )}

      {/* Time Up Message */}
      {timeLeft <= 0 && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-700 text-center font-medium">
            Time's up! Quiz will be submitted automatically.
          </p>
        </div>
      )}
    </div>
  );
};