import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/candidateApi';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.sendOTP(email);
      
      // If in development mode and OTP is returned (mock mode), show it
      if (response.data?.otp) {
        console.log('🔑 Development OTP:', response.data.otp);
        alert(`Development Mode: Your OTP is ${response.data.otp}\n\n${response.data.note || ''}`);
      }
      
      navigate('/verify-otp', { state: { email, otp: response.data?.otp, isLogin: true } });
    } catch (err) {
      // Only show "backend unreachable" if it's actually a network/server error
      // Never show "backend not reachable" here - that's only for health check
      // Show actual error messages for all API errors
      const errorMessage = err.userMessage || 
                          err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg ||
                          err.message || 
                          'Failed to send OTP. Please check your email and try again.';
      setError(errorMessage);
      
      console.error('OTP Send Error:', {
        message: err.message,
        response: err.response?.data,
        code: err.code,
      });
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
        error={error}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        loading={loading}
      >
        {loading ? 'Sending OTP...' : 'Continue'}
      </Button>
    </form>
  );
}

