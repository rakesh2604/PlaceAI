import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InterviewStartPage from '../../components/interview/InterviewStartPage';
import InterviewSession from '../../components/interview/InterviewSession';
import { interviewApi } from '../../services/candidateApi';

export default function InterviewLiveNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(location.state?.interview || null);
  const [stage, setStage] = useState('start'); // 'start' or 'session'
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!interview) {
      navigate('/interview/intro');
    }
  }, [interview, navigate]);

  const handleStart = async (detectedLanguage) => {
    setLanguage(detectedLanguage);
    
    try {
      // Begin the interview session
      const response = await interviewApi.begin(interview._id);
      setInterview(response.data.interview);
      setStage('session');
    } catch (error) {
      alert('Failed to start interview session. Please try again.');
    }
  };

  if (!interview) {
    return null;
  }

  if (stage === 'start') {
    return <InterviewStartPage interview={interview} onStart={handleStart} />;
  }

  return <InterviewSession interview={interview} language={language} />;
}

