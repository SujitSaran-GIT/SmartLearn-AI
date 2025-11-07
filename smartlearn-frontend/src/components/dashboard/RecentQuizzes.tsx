import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  created_at: string;
  latest_score: number | null;
  totalAttempts: number;
}

interface RecentQuizzesProps {
  quizzes: Quiz[];
}

const RecentQuizzes: React.FC<RecentQuizzesProps> = ({ quizzes }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Always show only 3 quizzes initially, show all when expanded
  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-50 dark:bg-success-900/20';
    if (score >= 60) return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20';
    return 'text-error-600 bg-error-50 dark:bg-error-900/20';
  };

  const handleViewAllClick = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-border-primary shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Recent Quizzes</h3>
          <p className="text-text-secondary text-sm">Your latest quiz activities</p>
        </div>
        <Clock className="w-5 h-5 text-text-tertiary" />
      </div>

      {/* Scrollable Container */}
      <div className={`flex-1 overflow-hidden ${showAll ? 'overflow-y-auto' : ''}`}>
        <div className="space-y-4">
          <AnimatePresence>
            {displayedQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border-secondary hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                    <BarChart2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {quiz.title.replace('Quiz - ', '')}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-tertiary">
                        {formatDate(quiz.created_at)}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {quiz.totalAttempts} attempt{quiz.totalAttempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {quiz.latest_score !== null && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(quiz.latest_score)}`}>
                      {quiz.latest_score}%
                    </div>
                  )}
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-bg-primary rounded-lg">
                    <Play className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {quizzes.length === 0 && (
            <div className="text-center py-8 text-text-tertiary">
              <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quizzes yet</p>
              <p className="text-sm mt-1">Create your first quiz to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* View All / Show Less Button */}
      {quizzes.length > 3 && (
        <motion.div
          className="pt-4 border-t border-border-primary mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={handleViewAllClick}
            className="w-full flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm py-2 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                View All Quizzes ({quizzes.length - 3} more)
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Show message when there are exactly 3 quizzes */}
      {quizzes.length === 3 && !showAll && (
        <div className="pt-4 border-t border-border-primary mt-4">
          <div className="text-center text-text-tertiary text-sm py-2">
            All quizzes displayed
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentQuizzes;