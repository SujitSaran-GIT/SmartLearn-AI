import React, { useState } from 'react';
import ProfileAvatar from './ProfileAvatar';
import SettingsModal from './SettingsModal';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext'; // 👈 Import global theme context
import type { RootState } from '../types';

interface NavbarProps {
  currentPage: string;
  toggleSidebar: () => void;
  isCollapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, toggleSidebar, isCollapsed }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // 👈 Access global theme
  const { user } = useSelector((state: RootState) => state.auth);

  const userInfo = user
    ? {
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        profilePic: undefined,
      }
    : null;

  const getPageTitle = () => {
    if (!currentPage) return 'Dashboard';
    return currentPage.split('/').pop()?.replace('-', ' ') || 'Dashboard';
  };

  return (
    <>
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] border-b border-[var(--border-primary)] shadow-md sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
              >
                {isCollapsed ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>

              <h1 className="text-lg font-semibold capitalize">{getPageTitle()}</h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                {userInfo && <ProfileAvatar user={userInfo} size="small" showName={true} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
