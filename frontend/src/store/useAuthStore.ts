import { create } from 'zustand';
import api from '../services/api';

interface User {
  username: string;
  role: string;
  memberId: string | null;
  batchId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  initialized: boolean;
  loading: boolean;
  initialize: () => void;
  login: (username: string, password: string) => Promise<void>;
  deliveryLogin: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  initialized: false,
  loading: false,

  initialize: () => {
    try {
      const token = localStorage.getItem('vj_token');
      const userStr = localStorage.getItem('vj_user');
      const user = userStr ? JSON.parse(userStr) : null;
      set({ token, user, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/users/login', { username, password });
      const { token, user } = res.data;
      
      localStorage.setItem('vj_token', token);
      localStorage.setItem('vj_user', JSON.stringify(user));
      
      set({ token, user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  deliveryLogin: async (username, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/delivery/login', { username, password });
      const { token, user } = res.data;

      localStorage.setItem('vj_token', token);
      localStorage.setItem('vj_user', JSON.stringify(user));

      set({ token, user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    const { token } = get();
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // logout failure is non-critical; session cleared in finally
    } finally {
      get().clearSession();
    }
  },

  clearSession: () => {
    localStorage.removeItem('vj_token');
    localStorage.removeItem('vj_user');
    set({ token: null, user: null });
  }
}));

import { setUnauthorizedCallback } from '../services/api';
setUnauthorizedCallback(() => {
  useAuthStore.getState().clearSession();
});
