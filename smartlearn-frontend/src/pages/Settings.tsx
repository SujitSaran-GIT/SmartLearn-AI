import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { logout } from '../redux/slices/authSlice';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  Bell, 
  Moon, 
  Globe, 
  Trash2, 
  Download,
  Key,
  Smartphone,
  Activity,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/auth');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature will be implemented');
    }
  };

  const handleExportData = () => {
    alert('Data export feature will be implemented');
  };

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
              <p className="text-text-secondary">Manage your account settings and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <motion.div
              className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-border-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Profile Information</h2>
                  <p className="text-text-secondary text-sm">Your personal account details</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-bg-primary rounded-lg border border-border-primary">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary text-lg">{user?.name || 'User'}</h3>
                    <p className="text-text-secondary">{user?.email || 'No email provided'}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 text-text-secondary mb-3">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm font-semibold">Email Address</span>
                    </div>
                    <p className="text-text-primary font-medium truncate">{user?.email || 'N/A'}</p>
                  </motion.div>

                  <motion.div 
                    className="p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-2 text-text-secondary mb-3">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-semibold">Member Since</span>
                    </div>
                    <p className="text-text-primary font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Preferences Card */}
            <motion.div
              className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-border-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Preferences</h2>
                  <p className="text-text-secondary text-sm">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Notifications Toggle */}
                <motion.div 
                  className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 transition-colors"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Notifications</h3>
                      <p className="text-sm text-text-secondary">Receive email notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        notifications ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </motion.div>

                {/* Dark Mode Toggle */}
                <motion.div 
                  className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 transition-colors"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Moon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Dark Mode</h3>
                      <p className="text-sm text-text-secondary">Toggle dark mode theme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      darkMode ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        darkMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </motion.div>

                {/* Language Selection */}
                <motion.div 
                  className="p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 transition-colors"
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Language</h3>
                      <p className="text-sm text-text-secondary">Choose your preferred language</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-border-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-bg-secondary text-text-primary transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </motion.div>
              </div>
            </motion.div>

            {/* Danger Zone Card */}
            <motion.div
              className="bg-bg-secondary rounded-xl shadow-lg border border-error-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-error-600">Danger Zone</h2>
                  <p className="text-error-500 text-sm">Irreversible actions</p>
                </div>
              </div>

              <div className="space-y-4">
                <motion.div 
                  className="p-4 bg-error-50 rounded-lg border border-error-200"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-error-900 mb-1">Delete Account</h3>
                      <p className="text-sm text-error-700">
                        Permanently remove your account and all data
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-semibold flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-4 bg-bg-primary rounded-lg border border-border-primary"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">Export Data</h3>
                      <p className="text-sm text-text-secondary">
                        Download all your data including quizzes and results
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-6 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors font-semibold flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Card */}
            <motion.div
              className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-border-primary sticky top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Security</h2>
                  <p className="text-text-secondary text-sm">Protect your account</p>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  className="w-full p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 hover:bg-bg-tertiary transition-all text-left group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Key className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                          Change Password
                        </h3>
                        <p className="text-sm text-text-secondary">Update your password</p>
                      </div>
                    </div>
                    <span className="text-primary-600 text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>

                <motion.button
                  className="w-full p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 hover:bg-bg-tertiary transition-all text-left group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                          2FA Authentication
                        </h3>
                        <p className="text-sm text-text-secondary">Add extra security</p>
                      </div>
                    </div>
                    <span className="text-primary-600 text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>

                <motion.button
                  className="w-full p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-primary-300 hover:bg-bg-tertiary transition-all text-left group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                          Active Sessions
                        </h3>
                        <p className="text-sm text-text-secondary">Manage sessions</p>
                      </div>
                    </div>
                    <span className="text-primary-600 text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Logout Card */}
            <motion.div
              className="bg-bg-secondary rounded-xl shadow-lg p-6 border border-error-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-6 h-6 text-error-600" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">Ready to leave?</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Sign out of your account securely
                </p>
                <motion.button
                  onClick={handleLogout}
                  className="w-full py-3 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;