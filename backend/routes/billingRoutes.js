import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createCheckoutSession, verifyWebhookSignature } from '../services/paymentService.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';
import plans from '../src/config/plans.js';
import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Get available plans
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(plans) });
});

// Create checkout session (for both candidates and recruiters)
router.post('/create-checkout-session',
  authenticate,
  idempotencyMiddleware,
  body('planId').isIn(['free', 'premium', 'enterprise']),
  body('period').optional().isIn(['monthly', 'yearly']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId, period = 'monthly' } = req.body;
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const plan = plans[planId];
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const price = period === 'monthly' ? plan.priceMonthly : plan.priceYearly;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Create payment record
      const payment = new Payment({
        userId: user._id,
        recruiterId: user.role === 'recruiter' ? (await Recruiter.findOne({ userId: user._id }))?._id : null,
        stripeSessionId: `temp_${Date.now()}`,
        status: 'pending',
        planType: planId,
        amount: price,
        currency: 'INR',
        metadata: { planId, period, userId: user._id.toString() }
      });
      await payment.save();

      // For demo/development: directly update user plan (in production, use Stripe checkout)
      if (process.env.NODE_ENV === 'development' || !process.env.STRIPE_SECRET_KEY) {
        // Mock payment - directly upgrade
        user.planId = planId;
        user.planActiveUntil = new Date(Date.now() + (period === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
        user.isPremium = planId !== 'free';
        await user.save();
        
        payment.status = 'completed';
        payment.stripeSessionId = `mock_${Date.now()}`;
        await payment.save();

        res.json({ 
          url: `${frontendUrl}/pricing/success?session_id=${payment.stripeSessionId}`,
          sessionId: payment.stripeSessionId,
          message: 'Plan upgraded successfully'
        });
      } else {
        // Production: Create Stripe checkout session
        try {
          const { createCheckoutSession } = await import('../services/paymentService.js');
          const recruiterId = user.role === 'recruiter' ? (await Recruiter.findOne({ userId: user._id }))?._id : null;
          const session = await createCheckoutSession(recruiterId || user._id.toString(), planId, frontendUrl);
          
          // Update payment with Stripe session ID
          payment.stripeSessionId = session.sessionId;
          await payment.save();

          res.json({ 
            url: session.url || `${frontendUrl}/pricing/success?session_id=${session.sessionId}`,
            sessionId: session.sessionId,
            message: 'Redirecting to payment...'
          });
        } catch (error) {
          console.error('Error creating Stripe session:', error);
          res.status(500).json({ message: 'Failed to create payment session' });
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  }
);

// Stripe webhook
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = verifyWebhookSignature(req.body, sig);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data.object;

      try {
        const payment = await Payment.findOne({ stripeSessionId: session.id });
        if (!payment) {
          console.error('Payment record not found for session:', session.id);
          return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'completed') {
          return res.json({ received: true });
        }

        // Update payment
        payment.status = 'completed';
        payment.stripeCustomerId = session.customer;
        payment.stripeChargeId = session.payment_intent || session.id;
        await payment.save();

        // Update user plan
        const user = await User.findById(payment.userId);
        if (user) {
          const planId = payment.metadata?.planId || payment.planType;
          const period = payment.metadata?.period || 'monthly';
          
          user.planId = planId;
          user.planActiveUntil = new Date(Date.now() + (period === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
          user.isPremium = planId !== 'free';
          await user.save();
        }

        // Update recruiter credits if applicable
        if (payment.recruiterId) {
          const recruiter = await Recruiter.findById(payment.recruiterId);
          if (recruiter) {
            const plan = PLANS[payment.metadata?.planId || 'basic'];
            recruiter.credits += plan.credits;
            recruiter.planType = payment.metadata?.planId || 'basic';
            
            recruiter.billingHistory.push({
              stripeSessionId: session.id,
              stripeChargeId: payment.stripeChargeId,
              amount: payment.amount,
              currency: payment.currency,
              planType: recruiter.planType,
              createdAt: new Date()
            });
            
            await recruiter.save();
          }
        }

        console.log('Payment processed successfully:', session.id);
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ message: 'Webhook processing failed' });
      }
    }

    res.json({ received: true });
  }
);

// Verify payment by session ID
router.get('/verify-payment/:sessionId',
  authenticate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find payment by session ID and user ID
      const payment = await Payment.findOne({
        stripeSessionId: sessionId,
        userId: user._id
      });

      if (!payment) {
        return res.status(404).json({ 
          valid: false,
          message: 'Payment not found or does not belong to this user' 
        });
      }

      // Check if payment is completed
      if (payment.status !== 'completed') {
        return res.status(400).json({ 
          valid: false,
          message: 'Payment is not completed',
          status: payment.status
        });
      }

      // Verify user plan matches payment
      const planId = payment.metadata?.planId || payment.planType;
      if (user.planId !== planId) {
        return res.status(400).json({ 
          valid: false,
          message: 'User plan does not match payment'
        });
      }

      res.json({ 
        valid: true,
        payment: {
          id: payment._id,
          planId: planId,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt
        }
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ 
        valid: false,
        message: 'Failed to verify payment' 
      });
    }
  }
);

// Get billing history (for both candidates and recruiters)
router.get('/history',
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const payments = await Payment.find({ 
        $or: [
          { userId: user._id },
          { recruiterId: user.role === 'recruiter' ? (await Recruiter.findOne({ userId: user._id }))?._id : null }
        ]
      })
        .sort({ createdAt: -1 });

      res.json({ payments });
    } catch (error) {
      console.error('Error fetching billing history:', error);
      res.status(500).json({ message: 'Failed to fetch billing history' });
    }
  }
);

export default router;

