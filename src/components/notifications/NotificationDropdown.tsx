"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { NotificationBell } from "./NotificationBell";
import { NotificationList } from "./NotificationList";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useUIStore } from "@/store/useUIStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { NotificationItem as NotificationItemType } from "@/types";

function MarkAllReadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-(--radius-sm) text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Mark all as read
    </button>
  );
}

export function NotificationDropdown() {
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const { activeModal, openModal, closeModal } = useUIStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const open = activeModal === "notifications";

  function handleOpenChange(next: boolean) {
    if (next) openModal("notifications");
    else closeModal();
  }

  function handleSelect(notification: NotificationItemType) {
    markRead(notification.id);
    if (notification.type === "request") openModal("conversation-requests");
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <NotificationBell unreadCount={unreadCount} active={open} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-2">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="font-heading text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && <MarkAllReadButton onClick={markAllRead} />}
          </div>
          <NotificationList
            notifications={notifications}
            onSelect={handleSelect}
            className="scrollbar-thin max-h-96 space-y-0.5 overflow-y-auto"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <NotificationBell unreadCount={unreadCount} active={open} onClick={() => handleOpenChange(true)} />
      <SheetContent>
        <SheetTitle className="sr-only">Notifications</SheetTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <SheetClose asChild>
            <IconButton label="Back">
              <ArrowLeft />
            </IconButton>
          </SheetClose>
          <p className="flex-1 font-heading text-base font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && <MarkAllReadButton onClick={markAllRead} />}
        </div>
        <NotificationList
          notifications={notifications}
          onSelect={handleSelect}
          className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-2"
        />
      </SheetContent>
    </Sheet>
  );
}
