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
  register: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setUsername: (username: string) => void;
  setStatus: (status: PresenceStatus) => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "username" | "bio" | "about" | "avatarUrl">>) => void;
  dismissUsernamePrompt: () => void;
  clearError: () => void;
}

const SIMULATED_DELAY = 600;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateUsername(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

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

      register: async ({ firstName, lastName, username, email }) => {
        set({ isLoading: true, error: null });
        await wait(SIMULATED_DELAY);

        const trimmedUsername = username.trim().replace(/^@/, "");
        const taken = seedUsers.some((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase());
        if (taken) {
          set({ isLoading: false, error: "That username is already taken." });
          return;
        }

        const newUser: User = {
          id: `u-${Date.now()}`,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: trimmedUsername,
          email,
          status: "online",
        };

        set({ user: newUser, isAuthenticated: true, isLoading: false });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        await wait(SIMULATED_DELAY);
        const current = seedUsers.find((u) => u.id === CURRENT_USER_ID)!;
        const googleUser: User = { ...current, username: generateUsername(current.name) };
        set({ user: googleUser, isAuthenticated: true, isLoading: false, needsUsername: true });
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

      updateProfile: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
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
