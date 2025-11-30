
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
import SubscriptionProvider, { useSubscription } from './contexts/SubscriptionContext';

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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="dashboard"><Dashboard /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="upload"><UploadFile /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/attempt-quiz" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="attempt-quiz"><AttemptQuiz /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/generate" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="generate"><GenerateQuiz /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/quizzes" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="quizzes"><Quizzes /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/quiz/:quizId/take" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="quiz"><TakeQuiz /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/results/:quizId" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="results"><Results /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="settings"><Settings /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="help"><HelpSupport /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/generate-quiz/:fileId" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="Generate Quiz"><QuizGeneration /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/exam/:jobId" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="Exam"><ExamScreen /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="Pricing"><Pricing /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="History"><History /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <SubscriptionProvider>
              <Layout currentPage="Leaderboard"><Leaderboard /></Layout>
            </SubscriptionProvider>
          </ProtectedRoute>
        } />
      </Routes>
  );
};

export default App;
