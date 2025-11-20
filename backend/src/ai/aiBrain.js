import dotenv from 'dotenv';
import interviewAI from './interviewAI.js';
import resumeAI from './resumeAI.js';
import jobAI from './jobAI.js';
import faqAI from './faqAI.js';

dotenv.config();

/**
 * Central AI Brain - Unified processing function
 * @param {string} type - Type of AI processing: "interview-score" | "resume-analysis" | "resume-ats" | "job-match" | "chat-faq"
 * @param {Object} payload - Context data depending on type
 * @returns {Promise<Object>} AI processing result
 */
export const process = async (type, payload) => {
  try {
    switch (type) {
      case 'interview-score':
        return await interviewAI.score(payload);
      
      case 'resume-analysis':
        return await resumeAI.analyze(payload);
      
      case 'resume-ats':
        return await resumeAI.atsScore(payload);
      
      case 'job-match':
        return await jobAI.match(payload);
      
      case 'chat-faq':
        return await faqAI.answer(payload);
      
      default:
        throw new Error(`Unknown AI processing type: ${type}`);
    }
  } catch (error) {
    console.error(`[AI Brain] Error processing ${type}:`, error);
    // Return fallback response
    return {
      error: true,
      message: error.message || 'AI processing failed',
      fallback: true
    };
  }
};

/**
 * Check if AI API is configured
 */
export const isAIConfigured = () => {
  return !!(process.env.AI_API_BASE_URL && process.env.AI_API_KEY);
};

/**
 * Call AI API with unified interface
 */
export const callAI = async (systemPrompt, userPrompt, options = {}) => {
  const {
    temperature = 0.7,
    responseFormat = 'json_object',
    model = 'gpt-4'
  } = options;

  // If API not configured, return null to trigger fallback
  if (!isAIConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.AI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        ...(responseFormat && { response_format: { type: responseFormat } })
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[AI Brain] API call error:', error);
    return null;
  }
};

export default { process, isAIConfigured, callAI };

