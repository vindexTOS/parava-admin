import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      token: s.token,
      isAuthenticated: s.isAuthenticated,
      login: s.login,
      logout: s.logout,
    }))
  );
}
