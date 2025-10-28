import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, signup, clearError } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';
import type { RootState } from '../../types';
import { Brain, LogIn, Shield, UserPlus2 } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching forms
  useEffect(() => {
    dispatch(clearError());
  }, [isLogin, dispatch]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    await dispatch(login(credentials));
  };

  const handleSignup = async (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
    const { confirmPassword, ...signupData } = userData;
    await dispatch(signup(signupData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center p-5">
      <div className="flex flex-col lg:flex-row max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        {/* Left Side - Illustration */}
        <motion.div
          className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center p-8 lg:p-12 relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center lg:text-left z-10 relative max-w-md">
            <div className='flex items-center gap-3'>
              <motion.div
                className="w-24 h-24 lg:w-20 lg:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6 lg:mb-8 backdrop-blur-sm border-2 border-white/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Brain className="w-12 h-12 lg:w-10 lg:h-10 text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                SMART LEARN AI
              </motion.h2>
            </div>

            <motion.h2
              className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
            </motion.h2>

            <motion.p
              className="text-lg lg:text-xl text-white/90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isLogin
                ? 'Sign in to access your personalized dashboard and continue your journey.'
                : 'Create an account to unlock all features and start your journey with us.'
              }
            </motion.p>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-xl"></div>
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div
          className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md">
            {/* Form Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${isLogin
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                  }`}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${!isLogin
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                  }`}
              >
                <UserPlus2 className="w-5 h-5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Forms */}
            <div className="w-full">
              {isLogin ? (
                <LoginForm
                  onSubmit={handleLogin}
                  loading={loading}
                />
              ) : (
                <SignupForm
                  onSubmit={handleSignup}
                  loading={loading}
                />
              )}
            </div>

            {/* Toggle Hint for Mobile */}
            <div className="text-center mt-8 text-gray-600">
              <span>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 font-semibold hover:text-indigo-700 underline transition-colors duration-200"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthComponent;