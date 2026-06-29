"use client";

import { Avatar } from "@/components/ui/avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { UnreadBadge } from "@/components/ui/badge";
import { Pin } from "@/components/ui/icons";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { getConversationMemberNames, getOtherParticipantIds } from "@/lib/conversation-utils";
import { useChatStore } from "@/store/useChatStore";
import { usePresence } from "@/store/usePresenceStore";
import type { Conversation, Message } from "@/types";

interface ConversationCardProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationCard({ conversation, isActive, onClick }: ConversationCardProps) {
  const lastMessage = useChatStore((s) => s.getLastMessage(conversation.id));
  const unreadCount = useChatStore((s) => s.getUnreadCount(conversation.id));
  const typingUserIds = useChatStore((s) => s.typingUsers[conversation.id]) ?? [];

  const otherId = conversation.type === "dm" ? getOtherParticipantIds(conversation)[0] : undefined;
  const otherUser = otherId ? getUserById(otherId) : undefined;
  const otherStatus = usePresence(otherId);
  const memberNames = getConversationMemberNames(conversation);
  const name = conversation.type === "group" ? conversation.name ?? "Group chat" : otherUser?.name ?? "Unknown";
  const isTyping = typingUserIds.length > 0;
  const preview = isTyping ? "typing…" : lastMessage ? buildPreview(conversation, lastMessage) : "No messages yet";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive}
      className={cn(
        "flex w-full items-center gap-3 rounded-(--radius-md) px-3 py-2.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-secondary"
      )}
    >
      {conversation.type === "group" ? (
        <GroupAvatar names={memberNames} size="md" />
      ) : (
        <Avatar name={name} size="md" presence={otherStatus} pulse />
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1">
            {conversation.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
            <span className="truncate font-medium text-foreground">{name}</span>
          </span>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              isTyping
                ? "font-medium text-primary"
                : unreadCount > 0
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
            )}
          >
            {preview}
          </span>
          <UnreadBadge count={unreadCount} className="shrink-0" />
        </span>
      </span>
    </button>
  );
}

function buildPreview(conversation: Conversation, message: Message) {
  const isOwn = message.senderId === CURRENT_USER_ID;
  const senderLabel =
    conversation.type === "group"
      ? isOwn
        ? "You"
        : getUserById(message.senderId)?.name?.split(" ")[0]
      : isOwn
        ? "You"
        : undefined;
  const prefix = senderLabel ? `${senderLabel}: ` : "";

  if (message.text) return `${prefix}${message.text}`;
  const attachment = message.attachments?.[0];
  if (attachment?.type === "image") return `${prefix}Sent a photo`;
  if (attachment?.type === "voice") return `${prefix}Sent a voice message`;
  if (attachment) return `${prefix}Sent a file`;
  return "No messages yet";
}
