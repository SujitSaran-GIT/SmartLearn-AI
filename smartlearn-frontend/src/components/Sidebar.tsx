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
  ChevronRight,
  CreditCard
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
    },
    {
      id: 'pricing',
      label: 'Pricing',
      path: "/pricing",
      icon: CreditCard,
      description: 'View Plans & Pricing'
    }
  ];

  const getMenuItemClasses = (path: string) => {
    const baseClasses = 'flex items-center rounded-xl transition-all duration-200 group ';
    const collapsedClasses = 'justify-center w-12 h-12 mx-auto';
    const expandedClasses = 'w-full space-x-3 px-4 py-3';

    if (location.pathname === path) {
      return baseClasses + (isCollapsed 
        ? `${collapsedClasses} bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white shadow-lg` 
        : `${expandedClasses} bg-gradient-to-r from-[var(--primary-50)] to-[var(--secondary-50)] text-[var(--primary-700)] border border-[var(--primary-200)] shadow-sm`);
    }

    return baseClasses + (isCollapsed 
      ? `${collapsedClasses} text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] hover:shadow-md` 
      : `${expandedClasses} text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] hover:shadow-sm`);
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
      <div className={`relative p-3 border-b border-[var(--border-primary)] ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Brain className={isCollapsed ? "w-4 h-4 text-white" : "w-6 h-6 text-white"} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-[var(--text-primary)] text-lg truncate">SmartLearn AI</h2>
              <p className="text-xs text-[var(--text-tertiary)] truncate">AI-Powered Learning</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white p-1 rounded-full border-2 border-[var(--bg-primary)] hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all shadow-lg z-10"
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
        <nav className={`space-y-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Main Navigation */}
          <div className={isCollapsed ? 'mb-4' : 'mb-6'}>
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
                  title={item.label}
                >
                  <item.icon className={isCollapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0"} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate">{item.label}</div>
                      <div className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className={isCollapsed ? 'mb-4' : 'mb-6'}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-[var(--text-quaternary)] uppercase tracking-wider px-4 mb-3">
                Analytics
              </h3>
            )}
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={getMenuItemClasses(item.path)}
                  title={item.label}
                >
                  <item.icon className={isCollapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0"} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate">{item.label}</div>
                      <div className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className={isCollapsed ? 'mb-4' : 'mb-6'}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-[var(--text-quaternary)] uppercase tracking-wider px-4 mb-3">
                Support
              </h3>
            )}
            <div className="space-y-1">
              <Link
                to="/help"
                className={getMenuItemClasses('/help')}
                title="Help & Support"
              >
                <HelpCircle className={isCollapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0"} />
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">Help & Support</div>
                    <div className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      Get assistance
                    </div>
                  </div>
                )}
              </Link>

              <Link
                to="/settings"
                className={getMenuItemClasses('/settings')}
                title="Settings"
              >
                <Settings className={isCollapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0"} />
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">Settings</div>
                    <div className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity truncate">
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
      <div className={`border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isCollapsed ? 'px-0 py-2' : 'px-4 py-3'}`}>
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-[var(--primary-400)] to-[var(--secondary-400)] rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
            <User className={isCollapsed ? "w-4 h-4 text-white" : "w-5 h-5 text-white"} />
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
              className="text-[var(--text-secondary)] hover:text-[var(--error-500)] transition p-2 rounded-lg hover:bg-[var(--bg-primary)] flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Stats - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-[var(--bg-tertiary)] rounded-lg p-2 shadow-sm">
                <div className="font-bold text-[var(--text-primary)]">12</div>
                <div className="text-[var(--text-tertiary)]">Tests</div>
              </div>
              <div className="bg-white dark:bg-[var(--bg-tertiary)] rounded-lg p-2 shadow-sm">
                <div className="font-bold text-[var(--success-500)]">87%</div>
                <div className="text-[var(--text-tertiary)]">Avg Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Logout Button */}
        {isCollapsed && (
          <div className="flex justify-center mt-1">
            <button 
              onClick={handleLogout}
              className="text-[var(--text-tertiary)] hover:text-[var(--error-500)] transition p-2 rounded-lg hover:bg-[var(--bg-primary)]"
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