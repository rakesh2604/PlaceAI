import { create } from 'zustand';

const loadTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored) {
    const root = document.documentElement;
    if (stored === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return stored;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const useThemeStore = create((set) => {
  const initialTheme = loadTheme();
  
  return {
    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme });
      localStorage.setItem('theme', theme);
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (newTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        return { theme: newTheme };
      });
    },
  };
});

