import axios from 'axios';
import { queueRequest, processQueuedRequests, generateIdempotencyKey } from './requestQueue.js';
import { networkSimulator } from '../utils/networkSimulator.js';

// Use environment variable or default to relative path (uses Vite proxy in dev)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't throw for 4xx errors
  }
});

/**
 * Health check function to test backend connectivity
 * This should be called on auth screen mount to verify backend is reachable
 * Returns true only if /api/health responds with 200 status
 * 
 * IMPORTANT: This error should ONLY be shown when health check fails.
 * Other API errors (validation, wrong OTP, etc.) should show their actual messages.
 */
export const testConnection = async () => {
  try {
    // baseURL is already '/api', so '/health' becomes '/api/health'
    // Use a shorter timeout for health check
    const response = await api.get('/health', {
      timeout: 3000,
      validateStatus: (status) => status < 500 // Don't throw for 4xx, only 5xx
    });
    
    // Only consider it connected if we get a 2xx response
    if (response.status >= 200 && response.status < 300) {
      return { connected: true, data: response.data };
    }
    
    // 4xx responses mean server is reachable but endpoint issue (shouldn't happen for /health)
    return { 
      connected: false, 
      error: `Health check returned status ${response.status}`, 
      isNetworkError: false 
    };
  } catch (error) {
    // Check if it's a network error (no response) or 5xx server error
    const isNetworkError = !error.response || 
                          error.code === 'ECONNREFUSED' || 
                          error.code === 'ETIMEDOUT' ||
                          error.code === 'ERR_NETWORK' ||
                          error.code === 'ERR_CONNECTION_REFUSED' ||
                          error.code === 'ECONNABORTED' ||
                          error.message?.includes('Network Error') ||
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('timeout');
    const isServerError = error.response?.status >= 500;
    
    // Error details captured in return object (no console logging in production)
    
    return { 
      connected: false, 
      error: error.message || 'Connection failed',
      baseURL: API_BASE_URL,
      isNetworkError: isNetworkError || isServerError,
      details: {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      }
    };
  }
};

// Request interceptor to add auth token, idempotency key, and network simulation
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add idempotency key for POST/PUT/PATCH requests if not present
    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && 
        !config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = generateIdempotencyKey();
    }
    
    // Apply network simulator in dev mode
    if (import.meta.env.DEV) {
      try {
        return await networkSimulator.simulate(config);
      } catch (error) {
        // Simulator wants to fail this request
        throw error;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and queue failed requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      // Network error details captured in userMessage (no console logging)
      
      // Provide helpful error message
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.userMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (error.code === 'ETIMEDOUT') {
        error.userMessage = 'Request timed out. The server may be slow or unreachable.';
      } else {
        error.userMessage = 'Network error. Please check your connection and try again.';
      }
      
      // Queue the request for retry if it's a network error
      if (error.config && ['post', 'put', 'patch'].includes(error.config.method?.toLowerCase())) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id || user.id || 'anonymous';
        const requestId = error.config.headers['Idempotency-Key'] || 
                         `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        await queueRequest(userId, requestId, {
          method: error.config.method,
          url: error.config.url,
          baseURL: error.config.baseURL,
          data: error.config.data,
          headers: error.config.headers,
          params: error.config.params
        }, error);
      }
    }
    
    // Handle 5xx server errors - also queue for retry
    if (error.response?.status >= 500 && error.config) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id || 'anonymous';
      const requestId = error.config.headers['Idempotency-Key'] || 
                       `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      if (['post', 'put', 'patch'].includes(error.config.method?.toLowerCase())) {
        await queueRequest(userId, requestId, {
          method: error.config.method,
          url: error.config.url,
          baseURL: error.config.baseURL,
          data: error.config.data,
          headers: error.config.headers,
          params: error.config.params
        }, error);
      }
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Process queued requests on reconnect
 * Call this when connection is restored (e.g., after health check succeeds)
 */
export const processQueuedRequestsOnReconnect = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id || 'anonymous';
    
    if (userId !== 'anonymous') {
      const results = await processQueuedRequests(userId, api);
      if (results.length > 0) {
        // Queued requests processed (no console logging in production)
      }
      return results;
    }
    return [];
  } catch (error) {
    // Error processing queued requests (handled silently)
    return [];
  }
};

// Listen for online event to retry queued requests
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Network connection restored, processing queued requests
    processQueuedRequestsOnReconnect();
  });
}

export default api;

