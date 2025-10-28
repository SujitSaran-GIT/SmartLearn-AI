import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../types';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);

  // Dynamic user data
  const userInfo = user ? {
    name: user.name || 'User',
    email: user.email,
    profilePic: undefined
  } : {
    name: 'User',
    email: '',
    profilePic: undefined
  };

  const menuItems = [
    {
      id: 'dashboard',
      path: "/dashboard",
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      id: 'upload',
      label: 'Upload Files',
      path: "/upload",
      icon: Upload,
      description: 'Add Learning Materials'
    },
    {
      id: 'attempt-quiz',
      label: 'Attempt Quiz',
      path: "/attempt-quiz",
      icon: Brain,
      description: 'Generate & Take Quiz'
    },
    {
      id: 'quizzes',
      label: 'My Quizzes',
      path: "/quizzes",
      icon: BookOpen,
      description: 'View & Take Quizzes'
    }
  ];

  const secondaryItems = [
    {
      id: 'history',
      label: 'History',
      path: "/history",
      icon: History,
      description: 'Past Attempts'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      path: "/leaderboard",
      icon: Trophy,
      description: 'Compare Performance'
    }
  ];

  const getMenuItemClasses = (path: string) => {
    const baseClasses = 'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ';

    if (location.pathname === path) {
      return baseClasses + 'bg-[var(--bg-tertiary)] text-[var(--primary-600)] shadow-sm border border-[var(--border-secondary)]';
    }

    return baseClasses + 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] hover:shadow-sm';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-[var(--bg-primary)] shadow-xl z-50 border-r border-[var(--border-primary)] flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-[var(--text-primary)] text-lg">SmartLearn AI</h2>
              <p className="text-xs text-[var(--text-tertiary)]">AI-Powered Learning</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-[var(--primary-500)] text-white p-1 rounded-full border-2 border-[var(--bg-primary)] hover:bg-[var(--primary-600)] transition-all shadow-lg"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {/* Main Navigation */}
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-[var(--text-quaternary)] uppercase tracking-wider px-4 mb-3">
                Main
              </h3>
            )}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={getMenuItemClasses(item.path)}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                Analytics
              </h3>
            )}
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={getMenuItemClasses(item.path)}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                Support
              </h3>
            )}
            <div className="space-y-1">
              <Link
                to="/help"
                className={getMenuItemClasses('/help')}
                title={isCollapsed ? 'Help & Support' : ''}
              >
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Help & Support</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Get assistance
                    </div>
                  </div>
                )}
              </Link>

              <Link
                to="/settings"
                className={getMenuItemClasses('/settings')}
                title={isCollapsed ? 'Settings' : ''}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Preferences & account
                    </div>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3`}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                {userInfo.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] truncate">
                {userInfo.email}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="text-[var(--text-secondary)] hover:text-[var(--error-500)] transition p-2 rounded-lg hover:bg-[var(--bg-primary)]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Stats - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                <div className="font-bold text-gray-800 dark:text-white">12</div>
                <div className="text-gray-500 dark:text-gray-400">Tests</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                <div className="font-bold text-green-600">87%</div>
                <div className="text-gray-500 dark:text-gray-400">Avg Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Logout Button */}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
