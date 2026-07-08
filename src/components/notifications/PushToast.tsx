"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "@/components/ui/icons";
import { TYPE_ICON, TYPE_COLOR } from "./NotificationItem";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useConversationRequestStore } from "@/store/useConversationRequestStore";
import { useGroupStore } from "@/store/useGroupStore";
import { useUIStore } from "@/store/useUIStore";
import type { NotificationItem as NotificationItemType } from "@/types";

const AUTO_DISMISS_MS = 5000;

function PushToastCard({ notification }: { notification: NotificationItemType }) {
  const router = useRouter();
  const dismissToast = useNotificationsStore((s) => s.dismissToast);
  const markRead = useNotificationsStore((s) => s.markRead);
  const openModal = useUIStore((s) => s.openModal);
  const acceptPing = useConversationRequestStore((s) => s.acceptPing);
  const declinePing = useConversationRequestStore((s) => s.declinePing);
  const approveRequest = useGroupStore((s) => s.approveRequest);
  const declineRequest = useGroupStore((s) => s.declineRequest);
  const Icon = TYPE_ICON[notification.type];
  const isPingWithAction = notification.type === "ping" && !!notification.actionId;
  const isJoinRequest = notification.type === "join-request" && !!notification.actionId;

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(notification.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification.id, dismissToast]);

  function handleClick() {
    markRead(notification.id);
    dismissToast(notification.id);
    if (notification.type === "ping") {
      openModal("pings");
    } else if (notification.conversationId) {
      router.push(`/chat/${notification.conversationId}`);
    } else {
      openModal("notifications");
    }
  }

  function handleAccept() {
    if (!notification.actionId) return;
    const conversationId = acceptPing(notification.actionId);
    markRead(notification.id);
    dismissToast(notification.id);
    if (conversationId) router.push(`/chat/${conversationId}`);
  }

  function handleDecline() {
    if (!notification.actionId) return;
    declinePing(notification.actionId);
    markRead(notification.id);
    dismissToast(notification.id);
  }

  function handleApproveJoin() {
    if (!notification.actionId) return;
    approveRequest(notification.actionId);
    markRead(notification.id);
    dismissToast(notification.id);
  }

  function handleDeclineJoin() {
    if (!notification.actionId) return;
    declineRequest(notification.actionId);
    markRead(notification.id);
    dismissToast(notification.id);
  }

  return (
    <div
      role="alert"
      className="pointer-events-auto flex w-full flex-col gap-2.5 rounded-(--radius-lg) border border-border bg-surface p-3.5 shadow-(--shadow-lg) animate-(--animate-slide-up)"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
              TYPE_COLOR[notification.type]
            )}
          >
            <Icon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{notification.title}</span>
            <span className="block truncate text-xs text-muted-foreground">{notification.body}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => dismissToast(notification.id)}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {isPingWithAction && (
        <div className="flex gap-2 pl-12">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 rounded-(--radius-md) bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 rounded-(--radius-md) border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Decline
          </button>
        </div>
      )}
      {isJoinRequest && (
        <div className="flex gap-2 pl-12">
          <button
            type="button"
            onClick={handleApproveJoin}
            className="flex-1 rounded-(--radius-md) bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={handleDeclineJoin}
            className="flex-1 rounded-(--radius-md) border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

export function PushToast() {
  const toastQueue = useNotificationsStore((s) => s.toastQueue);
  if (toastQueue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 top-2 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-80">
      {toastQueue.map((notification) => (
        <PushToastCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
