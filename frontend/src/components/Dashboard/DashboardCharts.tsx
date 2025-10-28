import React from 'react';
import type { Quiz } from '../../types';

interface DashboardChartsProps {
  tests: Quiz[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ tests }) => {
  const completedTests = tests.filter(test => test.status === 'completed' && test.score !== undefined);
  
  const scoreDistribution = [0, 0, 0, 0, 0]; // 0-59, 60-69, 70-79, 80-89, 90-100
  completedTests.forEach(test => {
    if (test.score! >= 90) scoreDistribution[4]++;
    else if (test.score! >= 80) scoreDistribution[3]++;
    else if (test.score! >= 70) scoreDistribution[2]++;
    else if (test.score! >= 60) scoreDistribution[1]++;
    else scoreDistribution[0]++;
  });

  const maxCount = Math.max(...scoreDistribution);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Score Distribution</h3>
      
      <div className="space-y-4">
        {[
          { label: '90-100', color: 'bg-green-500' },
          { label: '80-89', color: 'bg-blue-500' },
          { label: '70-79', color: 'bg-yellow-500' },
          { label: '60-69', color: 'bg-orange-500' },
          { label: '0-59', color: 'bg-red-500' }
        ].map((range, index) => (
          <div key={range.label} className="flex items-center space-x-4">
            <span className="w-12 text-sm font-medium text-gray-600">{range.label}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div 
                  className={`h-8 rounded-lg transition-all duration-500 ${range.color}`}
                  style={{ 
                    width: `${maxCount > 0 ? (scoreDistribution[index] / maxCount) * 100 : 0}%` 
                  }}
                ></div>
                <span className="text-sm font-medium text-gray-700 min-w-8">
                  {scoreDistribution[index]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{completedTests.length}</div>
            <div className="text-sm text-gray-600">Tests Taken</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {completedTests.length > 0 
                ? Math.round(completedTests.reduce((acc, test) => acc + test.score!, 0) / completedTests.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {completedTests.filter(test => test.score! >= 70).length}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
        </div>
      </div>
    </div>
  );
};