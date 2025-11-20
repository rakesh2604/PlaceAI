import { create } from 'zustand';

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null
    };
  } catch {
    return { token: null, user: null };
  }
};

export const useAuthStore = create((set) => ({
  ...loadFromStorage(),
  setAuth: (user, token) => {
    set({ user, token });
    if (token) {
      localStorage.setItem('token', token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  updateUser: (userData) => {
    set((state) => {
      const updatedUser = { ...state.user, ...userData };
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

