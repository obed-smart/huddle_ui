import { create } from "zustand";
import type { NotificationItem } from "@/types";
import { seedNotifications } from "@/lib/seed-data";

interface NotificationsState {
  notifications: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
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
}));
