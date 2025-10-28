import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.login(email, password);
      setUser(result.user);
      // In a real app, you would store the token
      localStorage.setItem('token', result.token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.signup(name, email, password);
      setUser(result.user);
      localStorage.setItem('token', result.token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    // In a real app, you would validate the token with the backend
    if (token) {
      // For demo purposes, set a mock user
      setUser({ id: '1', name: 'John Doe', email: 'john@example.com' });
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth
  };
};