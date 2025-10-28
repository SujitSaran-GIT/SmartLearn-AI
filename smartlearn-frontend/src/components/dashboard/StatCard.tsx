import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      text: 'text-primary-600 dark:text-primary-400',
      trend: 'text-primary-600 dark:text-primary-400',
      progress: 'bg-primary-500'
    },
    green: {
      bg: 'bg-success-50 dark:bg-success-900',
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      text: 'text-success-600 dark:text-success-400',
      trend: 'text-success-600 dark:text-success-400',
      progress: 'bg-success-500'
    },
    yellow: {
      bg: 'bg-warning-50 dark:bg-warning-900',
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      text: 'text-warning-600 dark:text-warning-400',
      trend: 'text-warning-600 dark:text-warning-400',
      progress: 'bg-warning-500'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      trend: 'text-orange-600 dark:text-orange-400',
      progress: 'bg-orange-500'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <motion.div
      className={`${currentColor.bg} rounded-xl p-6 border border-border-primary hover:shadow-lg transition-all duration-300`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${currentColor.iconBg} ${currentColor.text}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${currentColor.trend}`}>
            {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-text-primary mb-1">{value}</h3>
      <p className="text-text-secondary text-sm font-medium">{title}</p>
      
      {/* Progress Bar */}
      <div className="mt-4 w-full bg-bg-tertiary rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${currentColor.progress} transition-all duration-1000`}
          style={{ 
            width: typeof value === 'string' && value.includes('%') 
              ? value 
              : '70%' 
          }}
        ></div>
      </div>
    </motion.div>
  );
};

export default StatCard;