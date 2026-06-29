"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BellOff } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationBell } from "./NotificationBell";
import { NotificationItem } from "./NotificationItem";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useUIStore } from "@/store/useUIStore";
import type { NotificationItem as NotificationItemType } from "@/types";

export function NotificationDropdown() {
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const { activeModal, openModal, closeModal } = useUIStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const open = activeModal === "notifications";

  function handleSelect(notification: NotificationItemType) {
    markRead(notification.id);
    if (notification.type === "request") openModal("conversation-requests");
  }

  return (
    <Popover open={open} onOpenChange={(next) => (next ? openModal("notifications") : closeModal())}>
      <PopoverTrigger asChild>
        <NotificationBell unreadCount={unreadCount} active={open} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="font-heading text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-(--radius-sm) text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff />}
            title="No notifications"
            description="You're all caught up."
            className="p-6"
          />
        ) : (
          <div className="scrollbar-thin max-h-96 space-y-0.5 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleSelect(notification)}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
