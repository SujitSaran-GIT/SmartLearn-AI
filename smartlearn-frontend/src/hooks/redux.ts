import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { login, signup, logout, getCurrentUser } from '../redux/slices/authSlice';
import { uploadFile, getUserFiles, getFile, deleteFile } from '../redux/slices/fileSlice';
import { generateMCQ, getJobStatus, getUserJobs, pollJobStatus } from '../redux/slices/mcqSlice';
import { getUserQuizzes, getQuiz, submitQuiz, getQuizResults as getQuizResultsAction, getQuizAnalytics as getQuizAnalyticsAction, deleteQuiz } from '../redux/slices/quizSlice';

// Auth hooks
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const login = useCallback((credentials: any): any => {
    return dispatch(login(credentials));
  }, [dispatch]);

  const signup = useCallback((userData: any): any => {
    return dispatch(signup(userData));
  }, [dispatch]);

  const logout = useCallback((): any => {
    return dispatch(logout());
  }, [dispatch]);

  const getCurrentUser = useCallback((): any => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  return {
    ...auth,
    login,
    signup,
    logout,
    getCurrentUser,
  };
};

// File hooks
export const useFiles = () => {
  const dispatch = useAppDispatch();
  const files = useAppSelector(state => state.files);

  const uploadFile = useCallback((file: File): any => {
    return dispatch(uploadFile(file));
  }, [dispatch]);

  const getUserFiles = useCallback((params?: any): any => {
    return dispatch(getUserFiles(params));
  }, [dispatch]);

  const getFile = useCallback((fileId: string): any => {
    return dispatch(getFile(fileId));
  }, [dispatch]);

  const deleteFile = useCallback((fileId: string): any => {
    return dispatch(deleteFile(fileId));
  }, [dispatch]);

  return {
    ...files,
    uploadFile,
    getUserFiles,
    getFile,
    deleteFile,
  };
};

// MCQ hooks
export const useMCQ = () => {
  const dispatch = useAppDispatch();
  const mcq = useAppSelector(state => state.mcq);

  const generateMCQ = useCallback((data: any): any => {
    return dispatch(generateMCQ(data));
  }, [dispatch]);

  const getJobStatus = useCallback((jobId: string): any => {
    return dispatch(getJobStatus(jobId));
  }, [dispatch]);

  const getUserJobs = useCallback((params?: any): any => {
    return dispatch(getUserJobs(params));
  }, [dispatch]);

  const pollJobStatus = useCallback((jobId: string): any => {
    return dispatch(pollJobStatus(jobId));
  }, [dispatch]);

  return {
    ...mcq,
    generateMCQ,
    getJobStatus,
    getUserJobs,
    pollJobStatus,
  };
};

// Quiz hooks
export const useQuiz = () => {
  const dispatch = useAppDispatch();
  const quiz = useAppSelector(state => state.quiz);

  const getUserQuizzes = useCallback((params?: any): any => {
    return dispatch(getUserQuizzes(params));
  }, [dispatch]);

  const getQuiz = useCallback((quizId: string): any => {
    return dispatch(getQuiz(quizId));
  }, [dispatch]);

  const submitQuiz = useCallback((quizId: string, submission: any): any => {
    return dispatch(submitQuiz({ quizId, submission }));
  }, [dispatch]);

  const getQuizResults = useCallback((quizId: string): any => {
    return dispatch(getQuizResultsAction(quizId));
  }, [dispatch]);

  const getQuizAnalytics = useCallback((days?: number): any => {
    return dispatch(getQuizAnalyticsAction({ days }));
  }, [dispatch]);

  const deleteQuiz = useCallback((quizId: string): any => {
    return dispatch(deleteQuiz(quizId));
  }, [dispatch]);

  return {
    ...quiz,
    getUserQuizzes,
    getQuiz,
    submitQuiz,
    getQuizResults,
    getQuizAnalytics,
    deleteQuiz,
  };
};
