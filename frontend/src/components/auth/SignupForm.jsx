import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/candidateApi';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
      
      navigate('/verify-otp', { 
        state: { 
          email, 
          name,
          phone: phone || undefined,
          password: password || undefined,
          otp: response.data?.otp, 
          isLogin: false 
        } 
      });
    } catch (err) {
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
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
      />

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Phone (Optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 9876543210"
      />

      <Input
        label="Password (Optional)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create a password"
      />

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

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

