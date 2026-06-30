import { create } from "zustand";
import type { NotificationItem } from "@/types";
import { seedNotifications } from "@/lib/seed-data";

interface NotificationsState {
  notifications: NotificationItem[];
  toastQueue: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (input: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  dismissToast: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: seedNotifications,
  toastQueue: [],

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  addNotification: (input) =>
    set((state) => {
      const notification: NotificationItem = {
        ...input,
        id: `n-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      return {
        notifications: [notification, ...state.notifications],
        toastQueue: [...state.toastQueue, notification],
      };
    }),

  dismissToast: (id) =>
    set((state) => ({ toastQueue: state.toastQueue.filter((n) => n.id !== id) })),
}));
