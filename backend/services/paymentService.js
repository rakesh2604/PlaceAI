import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Stripe not configured. Payment operations will be mocked.');
}

// Plan configurations
export const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 29.99,
    credits: 10,
    description: '10 opt-in requests per month'
  },
  premium: {
    name: 'Premium Plan',
    price: 99.99,
    credits: 50,
    description: '50 opt-in requests per month'
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 299.99,
    credits: 200,
    description: '200 opt-in requests per month'
  }
};

export const createCheckoutSession = async (recruiterId, planId, frontendUrl) => {
  const plan = PLANS[planId];
  
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  if (!stripe) {
    // Mock response
    console.log(`[MOCK STRIPE] Creating checkout for recruiter ${recruiterId}, plan: ${planId}`);
    return {
      url: `${frontendUrl}/billing/success?session_id=mock_session_${Date.now()}`
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/recruiter/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/recruiter/billing?canceled=true`,
      metadata: {
        recruiterId: recruiterId.toString(),
        planId: planId,
        credits: plan.credits.toString()
      }
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

export const verifyWebhookSignature = (payload, signature) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('Stripe webhook secret not configured');
    return null;
  }

  if (!stripe) {
    return { mock: true };
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

