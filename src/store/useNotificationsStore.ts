import { create } from "zustand";
import type { NotificationItem } from "@/types";
import { seedNotifications } from "@/lib/seed-data";

interface NotificationsState {
  notifications: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (input: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: seedNotifications,

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  addNotification: (input) =>
    set((state) => ({
      notifications: [
        { ...input, id: `n-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
        ...state.notifications,
      ],
    })),
}));
