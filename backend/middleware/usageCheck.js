import { checkLimit, getFeatureKey } from '../src/config/plans.js';
import User from '../models/User.js';

/**
 * Middleware to check usage limits before allowing operations
 * @param {string} featureType - Type of feature: 'interview-score' | 'resume-ats' | 'resume-generation'
 */
export const checkUsage = (featureType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          code: 'USER_BLOCKED',
          message: 'Your account has been blocked. Please contact support.' 
        });
      }

      // Reset usage if month changed
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (user.usage.usageMonth !== currentMonth) {
        user.usage = {
          aiInterviewsThisMonth: 0,
          atsChecksThisMonth: 0,
          resumeGenerationsThisMonth: 0,
          usageMonth: currentMonth
        };
        await user.save();
      }

      // Get feature key
      const featureKey = getFeatureKey(featureType);
      if (!featureKey) {
        // No limit for this feature, allow
        return next();
      }

      // Check limit
      const limitCheck = checkLimit(
        { planId: user.planId },
        {
          aiInterviewsPerMonth: user.usage.aiInterviewsThisMonth,
          atsChecksPerMonth: user.usage.atsChecksThisMonth,
          resumeGenerationsPerMonth: user.usage.resumeGenerationsThisMonth
        },
        featureKey
      );

      if (!limitCheck.allowed) {
        return res.status(429).json({
          code: 'LIMIT_REACHED',
          message: `You've reached your ${user.planId === 'free' ? 'Free' : 'Premium'} plan limit for this feature. ${user.planId === 'free' ? 'Upgrade to Premium to continue.' : 'Your limit will reset next month.'}`,
          limit: limitCheck.limit,
          used: limitCheck.used,
          planId: user.planId
        });
      }

      // Store limit info in request for later increment
      req.usageInfo = {
        featureKey,
        limitCheck,
        user
      };

      next();
    } catch (error) {
      console.error('Usage check error:', error);
      res.status(500).json({ message: 'Failed to check usage limits' });
    }
  };
};

/**
 * Increment usage after successful operation
 */
export const incrementUsage = async (userId, featureKey) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Reset if month changed
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (user.usage.usageMonth !== currentMonth) {
      user.usage = {
        aiInterviewsThisMonth: 0,
        atsChecksThisMonth: 0,
        resumeGenerationsThisMonth: 0,
        usageMonth: currentMonth
      };
    }

    // Increment the appropriate counter
    if (featureKey === 'aiInterviewsPerMonth') {
      user.usage.aiInterviewsThisMonth += 1;
    } else if (featureKey === 'atsChecksPerMonth') {
      user.usage.atsChecksThisMonth += 1;
    } else if (featureKey === 'resumeGenerationsPerMonth') {
      user.usage.resumeGenerationsThisMonth += 1;
    }

    await user.save();
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
};

