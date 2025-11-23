import { create } from 'zustand';

const normalizeUser = (user) => {
  if (!user || !user._id || !user.email) {
    return null;
  }
  // Preserve all fields while ensuring required ones have defaults
  // Calculate profileCompleted if not provided by backend
  const hasPhone = !!(user.phone);
  const hasResume = !!(user.resume || user.resumeUrl);
  const hasRole = !!(user.selectedRoleId);
  return {
    _id: user._id,
    email: user.email || '',
    name: user.name || '',
    role: user.role || 'candidate',
    phone: user.phone || '',
    languages: user.languages || [],
    compensationPaise: user.compensationPaise || 0,
    currency: user.currency || 'INR',
    resume: user.resume || null,
    skills: user.skills || [],
    // Profile is complete if phone + resume exist (role is optional)
    profileCompleted: user.profileCompleted !== undefined 
      ? user.profileCompleted 
      : !!(hasPhone && hasResume),
    // Preserve additional fields
    resumeUrl: user.resumeUrl || null,
    selectedRoleId: user.selectedRoleId || null,
    planId: user.planId || 'free',
    isPremium: user.isPremium || false
  };
};

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const parsedUser = userStr ? JSON.parse(userStr) : null;
    const normalizedUser = normalizeUser(parsedUser);
    
    // Only return user if token exists and user is valid
    return {
      token: token || null,
      user: normalizedUser
    };
  } catch {
    return { token: null, user: null };
  }
};

export const useAuthStore = create((set) => ({
  ...loadFromStorage(),
  setAuth: (user, token) => {
    // Validate user object structure
    if (!user || !user._id || !user.email) {
      console.error('Invalid user object:', user);
      return;
    }
    
    // Normalize user object with all fields
    const normalizedUser = normalizeUser(user);
    if (!normalizedUser) {
      console.error('Invalid user object:', user);
      return;
    }
    
    set({ user: normalizedUser, token });
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  },
  updateUser: (userData) => {
    set((state) => {
      const mergedUser = { ...state.user, ...userData };
      const hasPhone = !!(mergedUser.phone);
      const hasResume = !!(mergedUser.resume || mergedUser.resumeUrl);
      const profileCompleted = mergedUser.profileCompleted !== undefined 
        ? mergedUser.profileCompleted 
        : !!(hasPhone && hasResume);
      const updatedUser = {
        ...mergedUser,
        profileCompleted
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}));

