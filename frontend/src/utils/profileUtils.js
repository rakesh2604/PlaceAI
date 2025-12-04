/**
 * Profile completion utilities
 * Centralized logic for checking if user profile is complete
 */

/**
 * Check if user profile is complete
 * Profile is complete if user has phone AND resume
 * 
 * @param {Object} user - User object from auth store
 * @returns {boolean} - True if profile is complete
 */
export const isProfileComplete = (user) => {
  if (!user) {
    console.log('[profileUtils] No user provided');
    return false;
  }
  
  // Use backend-provided flag if available (preferred)
  if (user.profileCompleted !== undefined) {
    const completed = Boolean(user.profileCompleted);
    console.log('[profileUtils] Using backend profileCompleted flag:', completed);
    return completed;
  }
  
  // Fallback: calculate from fields
  const hasPhone = Boolean(user.phone && user.phone.trim());
  const hasResume = Boolean(user.resumeUrl || (user.resume && user.resume.url));
  
  const completed = hasPhone && hasResume;
  console.log('[profileUtils] Calculated profile completion:', {
    completed,
    hasPhone,
    hasResume,
    phone: user.phone ? 'present' : 'missing',
    resumeUrl: user.resumeUrl ? 'present' : 'missing',
    resume: user.resume ? 'present' : 'missing'
  });
  
  return completed;
};

/**
 * Refetch user data from backend
 * @param {Function} updateUser - Update function from auth store
 * @param {Function} userApi - User API service
 * @returns {Promise<Object|null>} - Updated user object or null
 */
export const refetchUserData = async (updateUser, userApi) => {
  try {
    console.log('[profileUtils] Refetching user data from backend');
    const response = await userApi.getMe();
    if (response.data?.user) {
      const user = response.data.user;
      console.log('[profileUtils] User data refetched:', {
        phone: user.phone ? 'present' : 'missing',
        resumeUrl: user.resumeUrl ? 'present' : 'missing',
        profileCompleted: user.profileCompleted
      });
      updateUser(user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('[profileUtils] Error refetching user:', error);
    return null;
  }
};

