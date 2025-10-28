import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Content Area */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* Navbar */}
          <Navbar
            currentPage={currentPage}
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;