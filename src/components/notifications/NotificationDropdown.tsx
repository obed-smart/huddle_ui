"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { NotificationBell } from "./NotificationBell";
import { NotificationList } from "./NotificationList";
import { NotificationItem, TYPE_COLOR, TYPE_ICON } from "./NotificationItem";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useUIStore } from "@/store/useUIStore";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
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

interface NotificationPreviewProps {
  notification: NotificationItemType;
  onBack: () => void;
  onOpen: () => void;
}

function NotificationPreview({ notification, onBack, onOpen }: NotificationPreviewProps) {
  const Icon = TYPE_ICON[notification.type];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-(--radius-sm) text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to notifications"
        >
          <ArrowLeft className="size-5" />
        </button>
        <p className="flex-1 font-heading text-base font-semibold text-foreground">
          {notification.title}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <span className={cn("flex size-14 items-center justify-center rounded-full [&_svg]:size-6", TYPE_COLOR[notification.type])}>
          <Icon />
        </span>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">{notification.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>

        {(notification.conversationId || notification.type === "ping") && (
          <button
            type="button"
            onClick={onOpen}
            className="rounded-(--radius-md) bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open chat
          </button>
        )}
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const router = useRouter();
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const { activeModal, openModal, closeModal } = useUIStore();
  const [preview, setPreview] = useState<NotificationItemType | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const open = activeModal === "notifications";

  function handleOpenChange(next: boolean) {
    if (next) openModal("notifications");
    else {
      closeModal();
      setPreview(null);
    }
  }

  function handleNotificationClick(notification: NotificationItemType) {
    markRead(notification.id);
    setPreview(notification);
  }

  function handleOpen(notification: NotificationItemType) {
    setPreview(null);
    closeModal();
    if (notification.type === "ping") {
      openModal("pings");
    } else if (notification.conversationId) {
      router.push(`/chat/${notification.conversationId}`);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="left" className="flex flex-col p-0 w-full md:w-[38%] md:max-w-sm">
          <SheetTitle className="sr-only">Notifications</SheetTitle>

          {preview ? (
            <NotificationPreview
              notification={preview}
              onBack={() => setPreview(null)}
              onOpen={() => handleOpen(preview)}
            />
          ) : (
            <>
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
                onSelect={handleNotificationClick}
                className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-2"
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
