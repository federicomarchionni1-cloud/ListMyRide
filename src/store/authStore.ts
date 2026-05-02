import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  skipAuth: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSkipAuth: (skip: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  skipAuth: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setSkipAuth: (skip) => set({ skipAuth: skip }),
}));
