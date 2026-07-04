"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DayDivider } from "./DayDivider";
import { MessageGroup } from "./MessageGroup";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowDown, MessagesSquare } from "@/components/ui/icons";
import { groupMessagesByDay } from "@/lib/message-grouping";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import type { Conversation } from "@/types";

const BOTTOM_THRESHOLD = 120; // px from bottom → considered "at bottom"

interface MessageListProps {
  conversation: Conversation;
}

export function MessageList({ conversation }: MessageListProps) {
  const messages = useChatStore((s) => s.messagesByConversation[conversation.id]) ?? [];
  const typingUserIds = useChatStore((s) => s.typingUsers[conversation.id]) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  function checkBottom(el: HTMLDivElement) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
  }

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = checkBottom(el);
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
    if (atBottom) setUnreadCount(0);
  }, []);

  // Initial scroll to bottom on mount / conversation switch
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
    setUnreadCount(0);
    setShowScrollBtn(false);
    isAtBottomRef.current = true;
  }, [conversation.id]);

  // Smart scroll: only auto-scroll when already at bottom; count unread when not
  useEffect(() => {
    const newCount = messages.length - prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (newCount <= 0) return;

    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    } else {
      // Count messages from others (not own) as unread
      const newMessages = messages.slice(-newCount);
      const incomingCount = newMessages.filter((m) => m.senderId !== CURRENT_USER_ID).length;
      if (incomingCount > 0) setUnreadCount((prev) => prev + incomingCount);
    }
  }, [messages]);

  // Also auto-scroll when typing indicator appears while at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [typingUserIds.length]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    setUnreadCount(0);
    setShowScrollBtn(false);
    isAtBottomRef.current = true;
  }

  if (messages.length === 0 && typingUserIds.length === 0) {
    return (
      <EmptyState
        icon={<MessagesSquare />}
        title="No messages yet"
        description="Send a message to start the conversation."
      />
    );
  }

  const segments = groupMessagesByDay(messages);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-thin h-full overflow-y-auto px-4 py-4 md:px-6"
      >
        <div className="flex flex-col gap-4">
          {segments.map((segment) => (
            <div key={segment.date} className="flex flex-col gap-3">
              <DayDivider date={segment.date} />
              {segment.groups.map((group) => (
                <MessageGroup key={group[0].id} messages={group} conversation={conversation} />
              ))}
            </div>
          ))}
          {typingUserIds.length > 0 && (
            <TypingIndicator userIds={typingUserIds} showAvatar={conversation.type === "group"} />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll-to-bottom floating button */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to latest messages"
          className={cn(
            "absolute bottom-4 right-4 z-10 flex size-9 items-center justify-center rounded-full",
            "bg-surface shadow-md ring-1 ring-border/40",
            "text-foreground transition-all hover:bg-surface-hover active:scale-95",
            "animate-(--animate-scale-in)"
          )}
        >
          <ArrowDown className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
