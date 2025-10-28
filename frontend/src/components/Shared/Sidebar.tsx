import React from 'react';
import { 
  Brain, 
  Home, 
  Upload, 
  LogOut, 
  User, 
  Settings,
  BookOpen,
  Trophy,
  History,
  HelpCircle
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PageType } from '../../types';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType, params?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();


  const menuItems = [
    {
      id: 'dashboard' as PageType,
      path: "/dashboard",
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      id: 'upload' as PageType,
      label: 'Upload Module',
      path: "/upload",
      icon: Upload,
      description: 'Add Learning Materials'
    },
    {
      id: 'generate' as PageType,
      label: 'Generate Quiz',
      path: "/generate",
      icon: Brain,
      description: 'Create Practice Tests'
    },
    {
      id: 'review' as PageType,
      label: 'Review',
      path: "/review",
      icon: BookOpen,
      description: 'Check Answers & Progress'
    }
  ];

  const secondaryItems = [
    {
      id: 'history' as PageType,
      label: 'History',
      path: "/history",
      icon: History,
      description: 'Past Attempts'
    },
    {
      id: 'leaderboard' as PageType,
      label: 'Leaderboard',
      path: "/leaderboard",
      icon: Trophy,
      description: 'Compare Performance'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  const getMenuItemClasses = (path: string) => {
    const baseClasses = 'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ';
    
    if (location.pathname === path) {
      return baseClasses + 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100';
    }
    
    return baseClasses + 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">SmartLearn AI</h2>
            <p className="text-xs text-gray-500">AI-Powered Learning</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {/* Main Navigation */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              Main
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={getMenuItemClasses(item.path)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              Analytics
            </h3>
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={getMenuItemClasses(item.path)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              Support
            </h3>
            <div className="space-y-1">
              <button className={getMenuItemClasses('help' as PageType)}>
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Help & Support</div>
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Get assistance
                  </div>
                </div>
              </button>
              
              <button className={getMenuItemClasses('settings' as PageType)}>
                <Settings className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Settings</div>
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Preferences & account
                  </div>
                </div>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-white"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="font-bold text-gray-800">12</div>
              <div className="text-gray-500">Tests</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="font-bold text-green-600">87%</div>
              <div className="text-gray-500">Avg Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
