/**
 * Interview Session Checkpointing Service
 * 
 * Handles:
 * - Saving interview session state locally
 * - Resuming sessions after reload
 * - Managing transcript chunks and offsets
 * - Tracking evaluation job polling
 */

const STORAGE_PREFIX = 'placedai.session';

/**
 * Get checkpoint key for interview session
 */
const getCheckpointKey = (userId, sessionId) => {
  return `${STORAGE_PREFIX}.${userId || 'anonymous'}.${sessionId || 'default'}`;
};

/**
 * Save interview session checkpoint
 */
export const saveInterviewCheckpoint = (userId, sessionId, data) => {
  try {
    const key = getCheckpointKey(userId, sessionId);
    const checkpoint = {
      ...data,
      sessionId,
      userId,
      timestamp: Date.now(),
      version: 1
    };
    localStorage.setItem(key, JSON.stringify(checkpoint));
    return true;
  } catch (error) {
    console.error('Error saving interview checkpoint:', error);
    return false;
  }
};

/**
 * Load interview session checkpoint
 */
export const loadInterviewCheckpoint = (userId, sessionId) => {
  try {
    const key = getCheckpointKey(userId, sessionId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading interview checkpoint:', error);
    return null;
  }
};

/**
 * Remove interview session checkpoint
 */
export const removeInterviewCheckpoint = (userId, sessionId) => {
  try {
    const key = getCheckpointKey(userId, sessionId);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing interview checkpoint:', error);
    return false;
  }
};

/**
 * Update checkpoint with transcript chunk
 */
export const updateCheckpointTranscript = (userId, sessionId, questionId, offset, text) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint) return false;

  if (!checkpoint.transcriptChunks) {
    checkpoint.transcriptChunks = {};
  }

  if (!checkpoint.transcriptChunks[questionId]) {
    checkpoint.transcriptChunks[questionId] = [];
  }

  // Check for duplicate
  const existing = checkpoint.transcriptChunks[questionId].find(c => c.offset === offset);
  if (existing) {
    return true; // Already exists
  }

  checkpoint.transcriptChunks[questionId].push({
    offset,
    text,
    timestamp: Date.now()
  });

  // Sort by offset
  checkpoint.transcriptChunks[questionId].sort((a, b) => a.offset - b.offset);

  // Reconstruct full transcript
  checkpoint.transcripts = checkpoint.transcripts || {};
  checkpoint.transcripts[questionId] = checkpoint.transcriptChunks[questionId]
    .map(c => c.text)
    .join(' ');

  return saveInterviewCheckpoint(userId, sessionId, checkpoint);
};

/**
 * Get last processed offset for a question
 */
export const getLastOffset = (userId, sessionId, questionId) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint || !checkpoint.transcriptChunks || !checkpoint.transcriptChunks[questionId]) {
    return -1;
  }

  const chunks = checkpoint.transcriptChunks[questionId];
  if (chunks.length === 0) return -1;

  return Math.max(...chunks.map(c => c.offset));
};

/**
 * Get all unacknowledged chunks (for resume after reconnect)
 */
export const getUnacknowledgedChunks = (userId, sessionId, questionId) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint || !checkpoint.transcriptChunks || !checkpoint.transcriptChunks[questionId]) {
    return [];
  }

  return checkpoint.transcriptChunks[questionId].filter(c => !c.acknowledged);
};

/**
 * Mark chunk as acknowledged
 */
export const acknowledgeChunk = (userId, sessionId, questionId, offset) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint || !checkpoint.transcriptChunks || !checkpoint.transcriptChunks[questionId]) {
    return false;
  }

  const chunk = checkpoint.transcriptChunks[questionId].find(c => c.offset === offset);
  if (chunk) {
    chunk.acknowledged = true;
    return saveInterviewCheckpoint(userId, sessionId, checkpoint);
  }

  return false;
};

/**
 * Update checkpoint with evaluation job ID
 */
export const updateCheckpointEvaluationJob = (userId, sessionId, jobId) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint) return false;

  checkpoint.evaluationJobId = jobId;
  checkpoint.evaluationStatus = 'pending';
  return saveInterviewCheckpoint(userId, sessionId, checkpoint);
};

/**
 * Update checkpoint with evaluation status
 */
export const updateCheckpointEvaluationStatus = (userId, sessionId, status, result) => {
  const checkpoint = loadInterviewCheckpoint(userId, sessionId);
  if (!checkpoint) return false;

  checkpoint.evaluationStatus = status;
  if (result) {
    checkpoint.evaluationResult = result;
  }
  return saveInterviewCheckpoint(userId, sessionId, checkpoint);
};

/**
 * Get checkpoint data structure
 */
export const createCheckpointData = (sessionId, jobId, interview) => {
  return {
    sessionId,
    jobId,
    interviewId: interview._id,
    currentQuestionIndex: interview.currentQuestionIndex || 0,
    status: interview.status,
    questions: interview.questions || [],
    answers: interview.answers || [],
    transcriptChunks: {},
    transcripts: {},
    audioChunks: {},
    behaviorData: [],
    evaluationJobId: null,
    evaluationStatus: null,
    evaluationResult: null
  };
};

