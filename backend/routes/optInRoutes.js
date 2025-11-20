import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import RecruiterRequest from '../models/RecruiterRequest.js';
import Recruiter from '../models/Recruiter.js';
import User from '../models/User.js';
import { sendRecruiterOptInEmail, sendOptInAcceptedEmail } from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

const router = express.Router();

// Get opt-in requests for candidate
router.get('/requests', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can view opt-in requests' });
    }

    const requests = await RecruiterRequest.find({ candidateId: req.user._id })
      .populate('recruiterId', 'companyName')
      .populate('jobId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching opt-in requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Submit opt-in response (accept/reject)
router.post('/submit',
  authenticate,
  body('requestId').isMongoId(),
  body('status').isIn(['ACCEPTED', 'REJECTED']),
  body('note').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { requestId, status, note } = req.body;

      const request = await RecruiterRequest.findOne({
        _id: requestId,
        candidateId: req.user._id
      });

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ message: 'Request already processed' });
      }

      request.status = status;
      if (note) request.note = note;
      request.updatedAt = new Date();
      await request.save();

      // If accepted, notify recruiter
      if (status === 'ACCEPTED') {
        const recruiter = await Recruiter.findById(request.recruiterId);
        const recruiterUser = await User.findById(recruiter.userId);
        const candidate = await User.findById(req.user._id);

        // Send email
        await sendOptInAcceptedEmail(
          recruiterUser.email,
          candidate.email,
          note
        );

        // Send WhatsApp if phone available
        if (recruiterUser.phone) {
          await sendWhatsAppMessage(recruiterUser.phone, {
            type: 'opt_in_accepted',
            candidateName: candidate.email,
            note
          });
        }
      }

      res.json({ message: `Request ${status.toLowerCase()}`, request });
    } catch (error) {
      console.error('Error submitting opt-in:', error);
      res.status(500).json({ message: 'Failed to submit response' });
    }
  }
);

export default router;

