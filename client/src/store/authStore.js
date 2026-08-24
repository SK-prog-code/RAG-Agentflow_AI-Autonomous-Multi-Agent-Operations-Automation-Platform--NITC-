import { create } from 'zustand';
import api from '../services/api';
import { joinUserRoom } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('agentflow_token');
        const storedUser = localStorage.getItem('agentflow_user');
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          set({
            token: storedToken,
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          joinUserRoom(parsedUser._id);
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.error('Failed to parse local auth state:', err);
        set({ isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      joinUserRoom(user._id);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please check credentials.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async ({ name, email, password, role = 'operator', institution = 'NIT CALICUT' }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        institution,
      });
      const { user, token } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      joinUserRoom(user._id);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
