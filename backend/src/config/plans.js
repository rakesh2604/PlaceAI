/**
 * Plan definitions for PlacedAI
 * Limits can be numbers or "unlimited"
 */
export const plans = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfect for getting started',
    features: [
      '3 AI interviews per month',
      '3 ATS resume checks per month',
      '2 resume generations per month',
      'Basic job recommendations',
      'Email support'
    ],
    limits: {
      aiInterviewsPerMonth: 3,
      atsChecksPerMonth: 3,
      resumeGenerationsPerMonth: 2
    },
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 499,
    priceYearly: 4990, // ~17% discount
    description: 'For serious job seekers',
    features: [
      '40 AI interviews per month',
      '40 ATS resume checks per month',
      '30 resume generations per month',
      'Advanced job matching',
      'Priority support',
      'Interview analytics',
      'Resume templates'
    ],
    limits: {
      aiInterviewsPerMonth: 40,
      atsChecksPerMonth: 40,
      resumeGenerationsPerMonth: 30
    },
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 9999,
    priceYearly: 99990,
    description: 'For colleges and institutions',
    features: [
      'Unlimited AI interviews',
      'Unlimited ATS checks',
      'Unlimited resume generations',
      'Bulk student management',
      'Custom integrations',
      'Dedicated support',
      'Analytics dashboard'
    ],
    limits: {
      aiInterviewsPerMonth: 'unlimited',
      atsChecksPerMonth: 'unlimited',
      resumeGenerationsPerMonth: 'unlimited'
    },
    popular: false
  }
};

/**
 * Get plan by ID
 */
export const getPlan = (planId) => {
  return plans[planId] || plans.free;
};

/**
 * Check if user has reached limit for a feature
 */
export const checkLimit = (userPlan, usage, featureKey) => {
  const plan = getPlan(userPlan.planId || 'free');
  const limit = plan.limits[featureKey];
  
  if (limit === 'unlimited') {
    return { allowed: true, remaining: Infinity };
  }
  
  const used = usage[featureKey] || 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    limit,
    used
  };
};

/**
 * Get feature key from operation type
 */
export const getFeatureKey = (operationType) => {
  const mapping = {
    'interview-score': 'aiInterviewsPerMonth',
    'resume-ats': 'atsChecksPerMonth',
    'resume-analysis': 'atsChecksPerMonth',
    'resume-generation': 'resumeGenerationsPerMonth'
  };
  return mapping[operationType] || null;
};

export default plans;

