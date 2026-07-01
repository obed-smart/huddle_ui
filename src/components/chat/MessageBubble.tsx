"use client";

import { useRef, useState } from "react";
import { BubbleContent } from "./BubbleContent";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionPills } from "./ReactionPills";
import { ReadReceipt } from "./ReadReceipt";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, Reply, Smile } from "@/components/ui/icons";
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
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlyAttachment =
    !message.text && message.attachments?.length === 1 ? message.attachments[0] : undefined;
  const bare = onlyAttachment?.type === "image";

  function handleReact(emoji: string) {
    toggleReaction(message.conversationId, message.id, emoji, CURRENT_USER_ID);
    setPickerOpen(false);
  }

  function handleCopy() {
    if (message.text) {
      navigator.clipboard.writeText(message.text).catch(() => {});
    }
    setActionMenuOpen(false);
  }

  function handleOpenReact() {
    setActionMenuOpen(false);
    setPickerOpen(true);
  }

  function startLongPress() {
    pressTimer.current = setTimeout(() => setActionMenuOpen(true), LONG_PRESS_MS);
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
        {/* Hover-reveal reaction button (desktop) */}
        <ReactionPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleReact}
          align={isOwn ? "end" : "start"}
        />

        {/* Message bubble with long-press action menu */}
        <Popover open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
          <PopoverTrigger asChild>
            <div
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              onContextMenu={(e) => {
                e.preventDefault();
                setActionMenuOpen(true);
              }}
              className={cn(
                "select-none flex flex-col gap-2 cursor-default",
                !bare && "rounded-(--radius-lg) px-3.5 py-2.5",
                !bare &&
                  (isOwn
                    ? "bg-bubble-sent text-bubble-sent-foreground"
                    : "bg-bubble-received text-bubble-received-foreground")
              )}
            >
              <BubbleContent message={message} isOwn={isOwn} />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align={isOwn ? "end" : "start"}
            side="top"
            className="w-40 p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <button
              type="button"
              onClick={handleOpenReact}
              className="flex w-full items-center gap-2.5 rounded-(--radius-sm) px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Smile className="size-4 text-muted-foreground" />
              React
            </button>
            {message.text && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center gap-2.5 rounded-(--radius-sm) px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Copy className="size-4 text-muted-foreground" />
                Copy
              </button>
            )}
            <button
              type="button"
              onClick={() => setActionMenuOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-(--radius-sm) px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Reply className="size-4 text-muted-foreground" />
              Reply
            </button>
          </PopoverContent>
        </Popover>
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
