/**
 * Request Queue & Checkpointing Service
 * 
 * Handles:
 * - Queueing failed requests with Idempotency-Key
 * - Storing checkpoints in localStorage/IndexedDB
 * - Retrying queued requests on reconnect
 * - Exponential backoff for retries
 */

const STORAGE_PREFIX = 'placedai.session';
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 30000; // 30 seconds

/**
 * Generate a unique idempotency key
 */
export const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get storage key for user session
 */
const getSessionKey = (userId, requestId) => {
  return `${STORAGE_PREFIX}.${userId || 'anonymous'}.${requestId || 'default'}`;
};

/**
 * Store checkpoint in localStorage
 */
const saveCheckpoint = (userId, requestId, requestData) => {
  try {
    const key = getSessionKey(userId, requestId);
    const checkpoint = {
      ...requestData,
      timestamp: Date.now(),
      retryCount: requestData.retryCount || 0
    };
    localStorage.setItem(key, JSON.stringify(checkpoint));
    return true;
  } catch (error) {
    console.error('Error saving checkpoint:', error);
    return false;
  }
};

/**
 * Load checkpoint from localStorage
 */
const loadCheckpoint = (userId, requestId) => {
  try {
    const key = getSessionKey(userId, requestId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading checkpoint:', error);
    return null;
  }
};

/**
 * Remove checkpoint from localStorage
 */
const removeCheckpoint = (userId, requestId) => {
  try {
    const key = getSessionKey(userId, requestId);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing checkpoint:', error);
    return false;
  }
};

/**
 * Get all checkpoints for a user
 */
export const getAllCheckpoints = (userId) => {
  try {
    const checkpoints = [];
    const prefix = `${STORAGE_PREFIX}.${userId || 'anonymous'}.`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data) {
            checkpoints.push({
              key,
              requestId: key.split('.').pop(),
              ...data
            });
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    return checkpoints;
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    return [];
  }
};

/**
 * Calculate exponential backoff delay
 */
const calculateBackoff = (retryCount) => {
  const delay = Math.min(
    INITIAL_BACKOFF_MS * Math.pow(2, retryCount),
    MAX_BACKOFF_MS
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

/**
 * Queue a failed request for retry
 */
export const queueRequest = async (userId, requestId, requestConfig, error) => {
  const isNetworkError = !error.response || 
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ERR_CONNECTION_REFUSED' ||
    error.code === 'ECONNABORTED';

  // Only queue network errors or 5xx server errors
  if (!isNetworkError && error.response?.status < 500) {
    return false;
  }

  // Generate idempotency key if not present
  if (!requestConfig.headers) {
    requestConfig.headers = {};
  }
  if (!requestConfig.headers['Idempotency-Key']) {
    requestConfig.headers['Idempotency-Key'] = generateIdempotencyKey();
  }

  const checkpoint = {
    userId,
    requestId,
    config: requestConfig,
    error: {
      message: error.message,
      code: error.code,
      status: error.response?.status
    },
    retryCount: 0,
    nextRetryAt: Date.now() + calculateBackoff(0)
  };

  saveCheckpoint(userId, requestId, checkpoint);
  console.log(`[RequestQueue] Queued request ${requestId} for retry`);
  
  return true;
};

/**
 * Retry a queued request
 */
export const retryRequest = async (checkpoint, apiClient) => {
  const { config, retryCount } = checkpoint;

  if (retryCount >= MAX_RETRIES) {
    console.warn(`[RequestQueue] Max retries reached for request ${checkpoint.requestId}`);
    removeCheckpoint(checkpoint.userId, checkpoint.requestId);
    return { success: false, error: 'Max retries exceeded' };
  }

  try {
    // Wait for backoff delay if needed
    const now = Date.now();
    if (checkpoint.nextRetryAt > now) {
      const delay = checkpoint.nextRetryAt - now;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Make the request
    const response = await apiClient(config);

    // Success - remove checkpoint
    removeCheckpoint(checkpoint.userId, checkpoint.requestId);
    console.log(`[RequestQueue] Successfully retried request ${checkpoint.requestId}`);
    
    return { success: true, response };
  } catch (error) {
    // Update checkpoint with new retry info
    const updatedCheckpoint = {
      ...checkpoint,
      retryCount: retryCount + 1,
      nextRetryAt: Date.now() + calculateBackoff(retryCount + 1),
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status
      }
    };

    saveCheckpoint(checkpoint.userId, checkpoint.requestId, updatedCheckpoint);
    console.warn(`[RequestQueue] Retry ${retryCount + 1} failed for request ${checkpoint.requestId}:`, error.message);
    
    return { success: false, error };
  }
};

/**
 * Process all queued requests for a user
 */
export const processQueuedRequests = async (userId, apiClient) => {
  const checkpoints = getAllCheckpoints(userId);
  const results = [];

  console.log(`[RequestQueue] Processing ${checkpoints.length} queued requests for user ${userId}`);

  for (const checkpoint of checkpoints) {
    // Only retry if it's time
    if (checkpoint.nextRetryAt <= Date.now()) {
      const result = await retryRequest(checkpoint, apiClient);
      results.push({ requestId: checkpoint.requestId, ...result });
    }
  }

  return results;
};

/**
 * Clear all checkpoints for a user
 */
export const clearCheckpoints = (userId) => {
  try {
    const prefix = `${STORAGE_PREFIX}.${userId || 'anonymous'}.`;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[RequestQueue] Cleared ${keysToRemove.length} checkpoints for user ${userId}`);
    
    return keysToRemove.length;
  } catch (error) {
    console.error('Error clearing checkpoints:', error);
    return 0;
  }
};

