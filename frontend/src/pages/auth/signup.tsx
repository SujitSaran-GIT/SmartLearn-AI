import React, { useState } from 'react';
import { SignupForm } from '../../components/Auth/SignupForm';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PageType } from '../../types';

interface SignupPageProps {
  onNavigate: (page: PageType) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSignup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      await signup(name, email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onNavigate('login');
  };

  return (
    <SignupForm 
      onSignup={handleSignup}
      onSwitchToLogin={handleSwitchToLogin}
      loading={loading}
      error={error}
    />
  );
};