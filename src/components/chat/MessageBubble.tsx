"use client";

import { useRef, useState } from "react";
import { BubbleContent } from "./BubbleContent";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionPills } from "./ReactionPills";
import { ReadReceipt } from "./ReadReceipt";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, Pencil, Reply, Smile } from "@/components/ui/icons";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { cn, formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

const LONG_PRESS_MS = 450;
const SWIPE_THRESHOLD = 64;
const SWIPE_MAX = 80;

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isLast?: boolean;
}

export function MessageBubble({ message, isOwn, isLast }: MessageBubbleProps) {
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const setEditingMessage = useChatStore((s) => s.setEditingMessage);

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Swipe-to-reply state
  const [swipeX, setSwipeX] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const swipeTriggered = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlyAttachment =
    !message.text && message.attachments?.length === 1 ? message.attachments[0] : undefined;
  const bare = onlyAttachment?.type === "image";

  function handleReact(emoji: string) {
    toggleReaction(message.conversationId, message.id, emoji, CURRENT_USER_ID);
    setPickerOpen(false);
    setActionMenuOpen(false);
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

  function handleReply() {
    setActionMenuOpen(false);
    setReplyingTo({ conversationId: message.conversationId, message });
  }

  function handleEditStart() {
    setActionMenuOpen(false);
    setEditingMessage({ conversationId: message.conversationId, message });
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

  // Swipe-to-reply gesture handlers
  function onTouchStart(e: React.TouchEvent) {
    swipeStart.current = e.touches[0].clientX;
    swipeTriggered.current = false;
    startLongPress();
  }

  function onTouchMove(e: React.TouchEvent) {
    cancelLongPress();
    if (swipeStart.current === null) return;
    const delta = e.touches[0].clientX - swipeStart.current;
    if (delta > 0) {
      setSwipeX(Math.min(delta, SWIPE_MAX));
      if (delta >= SWIPE_THRESHOLD && !swipeTriggered.current) {
        swipeTriggered.current = true;
      }
    }
  }

  function onTouchEnd() {
    cancelLongPress();
    if (swipeTriggered.current) {
      setReplyingTo({ conversationId: message.conversationId, message });
    }
    setSwipeX(0);
    swipeStart.current = null;
    swipeTriggered.current = false;
  }

  const menuItemCls =
    "flex w-full items-center gap-2.5 rounded-(--radius-sm) px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      className={cn("group flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
      style={{ transform: `translateX(${swipeX}px)`, transition: swipeX === 0 ? "transform 0.25s ease" : "none" }}
    >
      <div className={cn("flex items-center gap-1.5", isOwn && "flex-row-reverse")}>
        {/* Hover-reveal reaction button (desktop) */}
        <ReactionPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleReact}
          align={isOwn ? "end" : "start"}
        />

        {/* Message bubble with long-press / right-click action menu */}
        <Popover open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
          <PopoverTrigger asChild>
            <div
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onContextMenu={(e) => { e.preventDefault(); setActionMenuOpen(true); }}
              className={cn(
                "select-none flex w-fit flex-col gap-2 cursor-default",
                !bare && "px-3.5 py-2.5",
                !bare && "rounded-2xl",
                // Tail: last bubble gets one squared-off corner pointing to the sender
                !bare && isLast && isOwn && "rounded-br-[4px]",
                !bare && isLast && !isOwn && "rounded-bl-[4px]",
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
            className="w-48 p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Quick-react bar */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border mb-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                  className="text-lg leading-none hover:scale-125 transition-transform focus-visible:outline-none"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={handleOpenReact}
                className="text-xs text-muted-foreground hover:text-foreground leading-none"
                aria-label="More reactions"
              >
                +
              </button>
            </div>

            {/* Action list */}
            <button type="button" onClick={handleOpenReact} className={menuItemCls}>
              <Smile className="size-4 text-muted-foreground" />
              React
            </button>
            {message.text && (
              <button type="button" onClick={handleCopy} className={menuItemCls}>
                <Copy className="size-4 text-muted-foreground" />
                Copy
              </button>
            )}
            <button type="button" onClick={handleReply} className={menuItemCls}>
              <Reply className="size-4 text-muted-foreground" />
              Reply
            </button>
            {isOwn && message.text && (
              <button type="button" onClick={handleEditStart} className={menuItemCls}>
                <Pencil className="size-4 text-muted-foreground" />
                Edit
              </button>
            )}
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
