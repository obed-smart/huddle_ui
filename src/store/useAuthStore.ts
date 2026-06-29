import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PresenceStatus, User } from "@/types";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsUsername: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setUsername: (username: string) => void;
  setStatus: (status: PresenceStatus) => void;
  dismissUsernamePrompt: () => void;
  clearError: () => void;
}

const SIMULATED_DELAY = 600;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needsUsername: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        await wait(SIMULATED_DELAY);

        if (!password || password.length < 4) {
          set({
            isLoading: false,
            error: "Enter a valid password (min. 4 characters).",
          });
          return;
        }

        const match =
          seedUsers.find(
            (u) =>
              u.email.toLowerCase() === identifier.toLowerCase() ||
              u.username.toLowerCase() === identifier.toLowerCase()
          ) ?? seedUsers.find((u) => u.id === CURRENT_USER_ID)!;

        set({ user: match, isAuthenticated: true, isLoading: false });
      },

      register: async ({ name, email }) => {
        set({ isLoading: true, error: null });
        await wait(SIMULATED_DELAY);

        const newUser: User = {
          id: `u-${Date.now()}`,
          name,
          username: name.toLowerCase().replace(/\s+/g, ""),
          email,
          status: "online",
        };

        set({ user: newUser, isAuthenticated: true, isLoading: false });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        await wait(SIMULATED_DELAY);
        const current = seedUsers.find((u) => u.id === CURRENT_USER_ID)!;
        set({ user: current, isAuthenticated: true, isLoading: false, needsUsername: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      setUsername: (username) =>
        set((state) => ({
          user: state.user ? { ...state.user, username } : state.user,
          needsUsername: false,
        })),

      setStatus: (status) =>
        set((state) => ({
          user: state.user ? { ...state.user, status } : state.user,
        })),

      dismissUsernamePrompt: () => set({ needsUsername: false }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "huddle-auth",
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
