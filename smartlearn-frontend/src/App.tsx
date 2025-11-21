
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import './App.css';
import UploadFile from './pages/UploadFile';
import { Route, Routes, Navigate } from 'react-router-dom';
import AuthComponent from './components/auth/AuthComponent';
import GenerateQuiz from './pages/GenerateQuiz';
import Quizzes from './pages/Quizzes';
import TakeQuiz from './pages/TakeQuiz';
import { useSelector } from 'react-redux';
import type { RootState } from './types';
import QuizGeneration from './components/QuizGeneration';
import ExamScreen from './components/ExamScreen';
import AttemptQuiz from './pages/AttemptQuiz';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import Pricing from './pages/Pricing';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import { tokenRefreshManager } from './utils/tokenRefresh';
import { useEffect } from 'react';
import { logout } from './redux/slices/authSlice';
import { useAppDispatch } from './redux/store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  // Initialize token refresh manager when app starts
  useEffect(() => {
    if (isAuthenticated) {
      tokenRefreshManager.startAutoRefresh();
    } else {
      tokenRefreshManager.stopAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      tokenRefreshManager.stopAutoRefresh();
    };
  }, [isAuthenticated]);

  // Handle refresh token failure by logging out user
  useEffect(() => {
    const handleRefreshFailure = () => {
      const token = localStorage.getItem('accessToken');
      if (!token && isAuthenticated) {
        dispatch(logout());
      }
    };

    const interval = setInterval(handleRefreshFailure, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);

  return (
      <Routes>
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout currentPage="dashboard"><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Layout currentPage="upload"><UploadFile /></Layout></ProtectedRoute>} />
        <Route path="/attempt-quiz" element={<ProtectedRoute><Layout currentPage="attempt-quiz"><AttemptQuiz /></Layout></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><Layout currentPage="generate"><GenerateQuiz /></Layout></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Layout currentPage="quizzes"><Quizzes /></Layout></ProtectedRoute>} />
        <Route path="/quiz/:quizId/take" element={<ProtectedRoute><Layout currentPage="quiz"><TakeQuiz /></Layout></ProtectedRoute>} />
        <Route path="/results/:quizId" element={<ProtectedRoute><Layout currentPage="results"><Results /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout currentPage="settings"><Settings /></Layout></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Layout currentPage="help"><HelpSupport /></Layout></ProtectedRoute>} />
        <Route path="/generate-quiz/:fileId" element={<ProtectedRoute><Layout currentPage="Generate Quiz"><QuizGeneration /></Layout></ProtectedRoute>} />
        <Route path="/exam/:jobId" element={<ProtectedRoute><Layout currentPage="Exam"><ExamScreen /></Layout></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Layout currentPage="Pricing"><Pricing /></Layout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Layout currentPage="History"><History /></Layout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Layout currentPage="Leaderboard"><Leaderboard /></Layout></ProtectedRoute>} />
      </Routes>
  );
};

export default App;
