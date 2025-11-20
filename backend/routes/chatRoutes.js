import express from 'express';
import { body, validationResult } from 'express-validator';
import aiBrain from '../src/ai/aiBrain.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = express.Router();

// Chat/FAQ endpoint
router.post('/ask',
  idempotencyMiddleware,
  body('query').notEmpty().trim(),
  body('context').optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { query, context } = req.body;

      // Process through AI Brain
      const response = await aiBrain.process('chat-faq', {
        query,
        context: context || null
      });

      res.json({
        success: true,
        response: response.answer || response,
        category: response.category || 'general',
        confidence: response.confidence || 0.8,
        source: response.source || 'ai-generated'
      });
    } catch (error) {
      console.error('Error processing chat query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process query',
        response: 'I apologize, but I encountered an error. Please try rephrasing your question or contact support@placedai.com for assistance.'
      });
    }
  }
);

export default router;

