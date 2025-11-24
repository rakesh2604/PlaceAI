import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import SupportTicket from '../models/SupportTicket.js';
import { sendContactNotification } from '../services/emailService.js';

const router = express.Router();

// Contact form submission
router.post('/contact',
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('subject').notEmpty().trim(),
  body('message').notEmpty().trim().isLength({ min: 10 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;
      const userId = req.user?._id || null;

      const ticket = new SupportTicket({
        userId,
        name,
        email,
        subject,
        message,
        status: 'open'
      });

      await ticket.save();

      // Send email notification to admin
      await sendContactNotification({ 
        name, 
        email, 
        subject, 
        message, 
        ticketId: ticket._id.toString() 
      });

      res.json({
        success: true,
        message: 'Your message has been received. We\'ll get back to you soon!',
        ticketId: ticket._id
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to submit contact form. Please try again.' 
      });
    }
  }
);

// Get user's support tickets (authenticated)
router.get('/tickets',
  authenticate,
  async (req, res) => {
    try {
      const tickets = await SupportTicket.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

      res.json({ tickets });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }
);

export default router;

