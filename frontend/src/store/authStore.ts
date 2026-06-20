import { create } from 'zustand';
import { AuthResponse, UserInfo } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      handleAuthSuccess(data, set);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
    }
  },

  register: async (fullName: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register(fullName, email, password);
      handleAuthSuccess(data, set);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),

  loadFromStorage: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true });
      } catch {
        localStorage.clear();
      }
    }
  },
}));

function handleAuthSuccess(data: AuthResponse, set: any) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  set({
    user: data.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
}
