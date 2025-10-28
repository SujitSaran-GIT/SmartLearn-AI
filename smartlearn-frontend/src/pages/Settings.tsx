import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { logout } from '../redux/slices/authSlice';
import { User, Mail, Calendar, Shield, LogOut, Bell, Moon, Globe, Trash2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account settings and preferences</p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-600" />
            Profile Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary text-lg">{user?.name}</h3>
                <p className="text-text-secondary">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-border-primary rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm font-semibold">Email</span>
                </div>
                <p className="text-text-primary font-medium">{user?.email}</p>
              </div>

              <div className="p-4 border-2 border-border-primary rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-semibold">Member Since</span>
                </div>
                <p className="text-text-primary font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Preferences
          </h2>

          <div className="space-y-4">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-text-secondary" />
                <div>
                  <h3 className="font-semibold text-text-primary">Notifications</h3>
                  <p className="text-sm text-text-secondary">Receive email notifications</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-bg-tertiary'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-bg-primary rounded-full transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-text-secondary" />
                <div>
                  <h3 className="font-semibold text-text-primary">Dark Mode</h3>
                  <p className="text-sm text-text-secondary">Toggle dark mode theme</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-bg-tertiary'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-bg-primary rounded-full transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <div className="p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-text-secondary" />
                <div>
                  <h3 className="font-semibold text-text-primary">Language</h3>
                  <p className="text-sm text-text-secondary">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border-primary rounded-lg focus:border-primary-500 focus:outline-none bg-bg-primary text-text-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Security
          </h2>

          <div className="space-y-4">
            <button
              className="w-full p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                    Change Password
                  </h3>
                  <p className="text-sm text-text-secondary">Update your password</p>
                </div>
                <span className="text-primary-600 text-2xl">→</span>
              </div>
            </button>

            <button
              className="w-full p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-text-secondary">Add an extra layer of security</p>
                </div>
                <span className="text-primary-600 text-2xl">→</span>
              </div>
            </button>

            <button
              className="w-full p-4 border-2 border-border-primary rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600">
                    Active Sessions
                  </h3>
                  <p className="text-sm text-text-secondary">Manage your active sessions</p>
                </div>
                <span className="text-primary-600 text-2xl">→</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg border-2 border-error-200 p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-error-600 mb-6 flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-error-50 rounded-lg">
              <h3 className="font-semibold text-error-900 mb-2">Delete Account</h3>
              <p className="text-sm text-error-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-semibold"
              >
                Delete My Account
              </button>
            </div>

            <div className="p-4 bg-bg-tertiary rounded-lg">
              <h3 className="font-semibold text-text-primary mb-2">Export Data</h3>
              <p className="text-sm text-text-secondary mb-4">
                Download all your data including quizzes, attempts, and results.
              </p>
              <button className="px-6 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors font-semibold">
                Export My Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleLogout}
            className="px-8 py-4 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-semibold flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;