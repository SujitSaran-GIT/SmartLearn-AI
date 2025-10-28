import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/Auth/LoginForm';
import { useAuthContext } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  return (
    <LoginForm 
      onLogin={handleLogin}
      onSwitchToSignup={handleSwitchToSignup}
      loading={loading}
      error={error}
    />
  );
};