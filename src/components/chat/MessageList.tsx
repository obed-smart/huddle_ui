"use client";

import { useEffect, useRef } from "react";
import { DayDivider } from "./DayDivider";
import { MessageGroup } from "./MessageGroup";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "@/components/ui/empty-state";
import { MessagesSquare } from "@/components/ui/icons";
import { groupMessagesByDay } from "@/lib/message-grouping";
import { useChatStore } from "@/store/useChatStore";
import type { Conversation } from "@/types";

interface MessageListProps {
  conversation: Conversation;
}

export function MessageList({ conversation }: MessageListProps) {
  const messages = useChatStore((s) => s.messagesByConversation[conversation.id]) ?? [];
  const typingUserIds = useChatStore((s) => s.typingUsers[conversation.id]) ?? [];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, typingUserIds.length]);

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
    <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
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
  );
}
