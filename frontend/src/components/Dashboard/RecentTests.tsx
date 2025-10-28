import React from 'react';
import { CheckCircle, Clock, FileText, ChevronRight, TrendingUp } from 'lucide-react';
import type { Quiz } from '../../types';
import { calculateScoreColor, formatDate } from '../../utils/formating';

interface RecentTestsProps {
  tests: Quiz[];
  onViewAll?: () => void;
  onTestClick?: (testId: string) => void;
  title?: string;
  maxItems?: number;
}

export const RecentTests: React.FC<RecentTestsProps> = ({ 
  tests, 
  onViewAll, 
  onTestClick,
  title = "Recent Tests",
  maxItems = 5
}) => {
  const displayedTests = tests.slice(0, maxItems);

  const getStatusIcon = (quiz: Quiz) => {
    if (quiz.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (quiz.status === 'in-progress') {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getScoreTrend = (quiz: Quiz, index: number) => {
    if (quiz.status !== 'completed' || quiz.score === undefined) return null;
    
    // Simple trend calculation based on previous test score
    if (index > 0) {
      const prevTest = tests[index - 1];
      if (prevTest.score && quiz.score > prevTest.score) {
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {onViewAll && tests.length > maxItems && (
          <button 
            onClick={onViewAll}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {displayedTests.map((quiz, index) => (
          <div 
            key={quiz.id} 
            onClick={() => onTestClick?.(quiz.id)}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer group"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                quiz.status === 'completed' ? 'bg-green-100' : 
                quiz.status === 'in-progress' ? 'bg-yellow-100' : 
                'bg-gray-200'
              }`}>
                {getStatusIcon(quiz)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{quiz.title}</h3>
                <p className="text-sm text-gray-600">
                  {quiz.questionCount} questions • {formatDate(quiz.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {quiz.score !== undefined && (
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <p className={`text-2xl font-bold ${calculateScoreColor(quiz.score)}`}>
                      {quiz.score}%
                    </p>
                    {getScoreTrend(quiz, index)}
                  </div>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              )}
              <button type="button" aria-label="View test details" className="p-2 hover:bg-white rounded-lg transition opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
        
        {tests.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tests Yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading a module and generating your first quiz!</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              Upload Module
            </button>
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {tests.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {tests.filter(t => t.status === 'in-progress').length}
              </div>
              <div className="text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {tests.length}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
