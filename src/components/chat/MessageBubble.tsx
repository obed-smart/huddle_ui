"use client";

import { useRef, useState } from "react";
import { BubbleContent } from "./BubbleContent";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionPills } from "./ReactionPills";
import { ReadReceipt } from "./ReadReceipt";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { cn, formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

const LONG_PRESS_MS = 450;

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlyAttachment =
    !message.text && message.attachments?.length === 1 ? message.attachments[0] : undefined;
  const bare = onlyAttachment?.type === "image";

  function handleReact(emoji: string) {
    toggleReaction(message.conversationId, message.id, emoji, CURRENT_USER_ID);
    setPickerOpen(false);
  }

  function startLongPress() {
    pressTimer.current = setTimeout(() => setPickerOpen(true), LONG_PRESS_MS);
  }

  function cancelLongPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <div className={cn("group flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
      <div className={cn("flex items-center gap-1.5", isOwn && "flex-row-reverse")}>
        <ReactionPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleReact}
          align={isOwn ? "end" : "start"}
        />
        <div
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(
            "flex flex-col gap-2",
            !bare && "rounded-(--radius-lg) px-3.5 py-2.5",
            !bare &&
              (isOwn
                ? "bg-bubble-sent text-bubble-sent-foreground"
                : "bg-bubble-received text-bubble-received-foreground")
          )}
        >
          <BubbleContent message={message} isOwn={isOwn} />
        </div>
      </div>
      {message.reactions && (
        <ReactionPills reactions={message.reactions} isOwn={isOwn} onToggle={handleReact} />
      )}
      <div
        className={cn(
          "flex items-center gap-1 px-1 text-[11px] text-muted-foreground",
          isOwn && "flex-row-reverse"
        )}
      >
        <span>{formatTimestamp(message.createdAt)}</span>
        {isOwn && <ReadReceipt status={message.status} />}
      </div>
    </div>
  );
}
