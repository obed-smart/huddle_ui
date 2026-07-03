import { create } from "zustand";
import { authService } from "@/services/authService";
import type { PresenceStatus, User } from "@/types";
import type { LoginDto, RegisterDto } from "@/lib/schema.validation";
import { getErrorMessage } from "@/lib/utils";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsUsername: boolean;
  isCheckingAuth: boolean;
  getCurrentUser: () => Promise<void>;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  setUsername: (username: string) => void;
  setStatus: (status: PresenceStatus) => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "username" | "bio" | "about" | "avatarUrl">>) => void;
  dismissUsernamePrompt: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsUsername: false,
  isCheckingAuth: true,

  getCurrentUser: async () => {
    try {
      const user = await authService.me();
      set({ user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) });
    }
  },

  loginWithGoogle: () => {
    authService.loginWithGoogle();
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  setUsername: (username) =>
    set((state) => ({
      user: state.user ? { ...state.user, username } : state.user,
      needsUsername: false,
    })),

  setStatus: (status) =>
    set((state) => ({
      user: state.user ? { ...state.user, status } : state.user,
    })),

  updateProfile: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : state.user,
    })),

  dismissUsernamePrompt: () => set({ needsUsername: false }),

  clearError: () => set({ error: null }),
}));
