import { create } from "zustand";
import type { PresenceStatus } from "@/types";
import { seedUsers } from "@/lib/seed-data";

interface PresenceState {
  statuses: Record<string, PresenceStatus>;
  setStatus: (userId: string, status: PresenceStatus) => void;
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  statuses: Object.fromEntries(seedUsers.map((u) => [u.id, u.status])),
  setStatus: (userId, status) =>
    set((state) => ({ statuses: { ...state.statuses, [userId]: status } })),
}));

export function usePresence(userId?: string): PresenceStatus | undefined {
  return usePresenceStore((s) => (userId ? s.statuses[userId] : undefined));
}
