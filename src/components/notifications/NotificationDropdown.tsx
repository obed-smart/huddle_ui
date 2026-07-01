"use client";

import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { NotificationBell } from "./NotificationBell";
import { NotificationList } from "./NotificationList";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useUIStore } from "@/store/useUIStore";
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
  const router = useRouter();
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const { activeModal, openModal, closeModal } = useUIStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const open = activeModal === "notifications";

  function handleOpenChange(next: boolean) {
    if (next) openModal("notifications");
    else closeModal();
  }

  function handleSelect(notification: NotificationItemType) {
    markRead(notification.id);
    closeModal();
    if (notification.type === "ping") {
      openModal("pings");
    } else if (notification.conversationId) {
      router.push(`/chat/${notification.conversationId}`);
    }
  }

  return (
    <>
      <NotificationBell
        unreadCount={unreadCount}
        active={open}
        onClick={() => handleOpenChange(!open)}
      />
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="left"
          className="w-full md:w-[38%] md:max-w-sm"
        >
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3.5">
            <SheetClose asChild>
              <IconButton label="Close notifications">
                <ArrowLeft />
              </IconButton>
            </SheetClose>
            <p className="flex-1 font-heading text-base font-semibold text-foreground">
              Notifications
            </p>
            {unreadCount > 0 && <MarkAllReadButton onClick={markAllRead} />}
          </div>
          <NotificationList
            notifications={notifications}
            onSelect={handleSelect}
            className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-2"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
