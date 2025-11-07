import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface ProgressData {
  date: string;
  score: number;
  attempts: number;
}

interface ProgressChartProps {
  data: ProgressData[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const maxScore = Math.max(...data.map(d => d.score), 100);
  const maxAttempts = Math.max(...data.map(d => d.attempts), 5);

  console.log(data);

  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-border-primary shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Progress Overview</h3>
          <p className="text-text-secondary text-sm">Your daily performance trends</p>
        </div>
        <div className="flex items-center gap-2 text-success-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Improving</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Score Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Average Score</span>
            <span className="text-sm text-text-tertiary">%</span>
          </div>
          <div className="relative h-32"> {/* Fixed-height wrapper */}
            <div className="absolute inset-0 flex justify-between gap-2 px-1"> {/* Absolute positioning for bars */}
              {data.map((day, index) => (
                <motion.div
                  key={day.date}
                  className="flex flex-col items-center flex-1 relative" // Removed scaleY; use bottom positioning
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer group max-w-[80px]" // Constrain width for spacing
                    style={{ height: `${(day.score / maxScore) * 100}%` }} // % now relative to fixed h-32
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-text-primary text-bg-primary text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {day.score}%
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary mt-8 relative z-10"> {/* Offset for bar height */}
                    {day.date}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Attempts Chart */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Daily Attempts</span>
            <span className="text-sm text-text-tertiary">Count</span>
          </div>
          <div className="relative h-20"> {/* Fixed-height wrapper; adjusted for smaller chart */}
            <div className="absolute inset-0 flex justify-between gap-2 px-1"> {/* Absolute positioning for bars */}
              {data.map((day, index) => (
                <motion.div
                  key={day.date}
                  className="flex flex-col items-center flex-1 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                >
                  <div
                    className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 bg-gradient-to-t from-success-500 to-success-300 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer group max-w-[80px]"
                    style={{ height: `${(day.attempts / maxAttempts) * 100}%` }} // % now relative to fixed h-20
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-text-primary text-bg-primary text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {day.attempts} attempts
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary mt-6 relative z-10"> {/* Offset for bar height */}
                    {day.date}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-primary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded"></div>
            <span className="text-xs text-text-secondary">Average Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded"></div>
            <span className="text-xs text-text-secondary">Daily Attempts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;