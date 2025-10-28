
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  color: 'indigo' | 'green' | 'purple' | 'orange' | 'blue' | 'red';
  badge?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    isNeutral?: boolean;
  };
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  value, 
  label, 
  color, 
  badge,
  trend,
  description
}) => {
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-100',
      badge: 'bg-green-100 text-green-700'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      badge: 'bg-purple-100 text-purple-700'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100',
      badge: 'bg-orange-100 text-orange-700'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      badge: 'bg-blue-100 text-blue-700'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      badge: 'bg-red-100 text-red-700'
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.isNeutral) {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
    
    return trend.isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    
    if (trend.isNeutral) {
      return 'text-gray-600';
    }
    
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${colorClasses[color].border} hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        
        <div className="flex items-center space-x-2">
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-semibold">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
          
          {badge && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClasses[color].badge}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
      
      {/* Progress bar for certain metrics */}
      {(typeof value === 'string' && value.includes('%')) && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${colorClasses[color].bg} ${colorClasses[color].text.replace('text', 'bg')}`}
              style={{ 
                width: typeof value === 'string' ? value : '0%' 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};