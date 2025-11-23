import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/candidateApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response.credential) {
      setError('Google authentication failed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authResponse = await authApi.googleAuth(response.credential);
      
      // Validate response structure
      if (!authResponse.data?.user || !authResponse.data?.token) {
        throw new Error('Invalid response from server');
      }
      
      setAuth(authResponse.data.user, authResponse.data.token);
      
      // Navigate to dashboard (profile completeness check happens on dashboard)
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.userMessage || 
                          err.message || 
                          'Google authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          // Google Client ID not configured (silent in production)
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse
        });

        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          });
        }
      } else {
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initGoogleSignIn, 100);
      }
    };

    initGoogleSignIn();
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      
      // Validate response structure
      if (!response.data?.user || !response.data?.token) {
        throw new Error('Invalid response from server');
      }
      
      setAuth(response.data.user, response.data.token);
      
      // Navigate to dashboard (profile completeness check happens on dashboard)
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg ||
                          err.userMessage || 
                          err.message || 
                          'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        error={error}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        loading={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-200 dark:border-dark-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-dark-800 text-dark-500 dark:text-dark-400">
            Or continue with
          </span>
        </div>
      </div>

      <div id="google-signin-button" className="w-full"></div>
    </form>
  );
}
