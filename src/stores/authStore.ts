import { create } from 'zustand';
import { getStoredToken, setStoredToken } from '../api';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),

  login: (token) => {
    setStoredToken(token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    setStoredToken(null);
    set({ token: null, isAuthenticated: false });
  },

  hydrate: () => set({ token: getStoredToken(), isAuthenticated: Boolean(getStoredToken()) }),
}));
