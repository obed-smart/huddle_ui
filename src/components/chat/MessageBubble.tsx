"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BubbleContent } from "./BubbleContent";
import { EmojiCategory } from "./EmojiCategory";
import { EmojiGrid } from "./EmojiGrid";
import { ReactionPills } from "./ReactionPills";
import { Copy, Pencil, Reply, Smile } from "@/components/ui/icons";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { useChatStore } from "@/store/useChatStore";
import { cn, formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

const LONG_PRESS_MS = 600;
const SWIPE_THRESHOLD = 64;
const SWIPE_MAX = 80;
const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];
const PANEL_W = 224; // w-56

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isLast?: boolean;
  senderName?: string;
}

export function MessageBubble({ message, isOwn, isLast, senderName }: MessageBubbleProps) {
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const setEditingMessage = useChatStore((s) => s.setEditingMessage);

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const [emojiActiveId, setEmojiActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const [panelPos, setPanelPos] = useState<React.CSSProperties>({});
  const [swipeX, setSwipeX] = useState(0);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  const swipeTriggered = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlyAttachment =
    !message.text && message.attachments?.length === 1 ? message.attachments[0] : undefined;
  const bare = onlyAttachment?.type === "image";

  const bubbleClasses = cn(
    "flex w-fit max-w-full min-w-0 overflow-hidden flex-col gap-2",
    !bare && "px-3.5 py-2.5 rounded-2xl",
    !bare && isLast && isOwn && "rounded-br-[4px]",
    !bare && isLast && !isOwn && "rounded-bl-[4px]",
    !bare && (isOwn
      ? "bg-bubble-sent text-bubble-sent-foreground"
      : "bg-bubble-received text-bubble-received-foreground")
  );

  function openActionMenu() {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      setBubbleRect(rect);
      // Lock position at open time so it never jumps when toggling emoji grid
      const vw = typeof window !== "undefined" ? window.innerWidth : 400;
      const top = Math.max(8, rect.bottom + 8);
      const xStyle: React.CSSProperties = isOwn
        ? { right: Math.max(8, vw - rect.right) }
        : { left: Math.min(rect.left, vw - PANEL_W - 8) };
      setPanelPos({ top, ...xStyle });
    }
    setShowEmojiGrid(false);
    setEmojiActiveId(EMOJI_CATEGORIES[0].id);
    setActionMenuOpen(true);
  }

  function closeActionMenu() {
    setActionMenuOpen(false);
    setShowEmojiGrid(false);
  }

  function handleReact(emoji: string) {
    toggleReaction(message.conversationId, message.id, emoji, CURRENT_USER_ID);
    closeActionMenu();
  }

  function handleCopy() {
    if (message.text) navigator.clipboard.writeText(message.text).catch(() => {});
    closeActionMenu();
  }

  function handleReply() {
    closeActionMenu();
    setReplyingTo({ conversationId: message.conversationId, message });
  }

  function handleEditStart() {
    closeActionMenu();
    setEditingMessage({ conversationId: message.conversationId, message });
  }

  function startLongPress() {
    pressTimer.current = setTimeout(openActionMenu, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }

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
      if (delta >= SWIPE_THRESHOLD && !swipeTriggered.current) swipeTriggered.current = true;
    }
  }

  function onTouchEnd() {
    cancelLongPress();
    if (swipeTriggered.current) setReplyingTo({ conversationId: message.conversationId, message });
    setSwipeX(0);
    swipeStart.current = null;
    swipeTriggered.current = false;
  }

  const activeCategory = EMOJI_CATEGORIES.find((c) => c.id === emojiActiveId) ?? EMOJI_CATEGORIES[0];

  const menuItemCls =
    "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none";

  return (
    <>
      <div
        className={cn("group flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
        style={{ transform: `translateX(${swipeX}px)`, transition: swipeX === 0 ? "transform 0.25s ease" : "none" }}
      >
        <div className={cn("flex items-center gap-1.5", isOwn && "flex-row-reverse")}>
          <div
            ref={bubbleRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onContextMenu={(e) => { e.preventDefault(); openActionMenu(); }}
            className={cn("select-none cursor-default", bubbleClasses)}
          >
            <BubbleContent
              message={message}
              isOwn={isOwn}
              senderName={senderName}
              timestamp={formatTimestamp(message.createdAt)}
            />
          </div>
        </div>

        {message.reactions && (
          <ReactionPills reactions={message.reactions} isOwn={isOwn} onToggle={handleReact} />
        )}
      </div>

      {/* WhatsApp-style zoom + blur overlay */}
      {actionMenuOpen && bubbleRect && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99]" onClick={closeActionMenu}>
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[6px]" aria-hidden />

          {/* Elevated bubble clone */}
          <div
            className="pointer-events-none absolute z-[101]"
            style={{
              top: bubbleRect.top,
              left: bubbleRect.left,
              width: bubbleRect.width,
              transform: "scale(1.04)",
              transformOrigin: isOwn ? "right center" : "left center",
            }}
          >
            <div className={cn(bubbleClasses, "shadow-2xl")}>
              <BubbleContent
                message={message}
                isOwn={isOwn}
                senderName={senderName}
                timestamp={formatTimestamp(message.createdAt)}
              />
            </div>
          </div>

          {/* Action panel */}
          <div
            className="absolute z-[102] overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border/30"
            style={{ width: PANEL_W, ...panelPos }}
            onClick={(e) => e.stopPropagation()}
          >
            {showEmojiGrid ? (
              <div className="p-2.5">
                <div className="mb-2 flex items-center gap-0.5 border-b border-border pb-2">
                  {EMOJI_CATEGORIES.map((cat) => (
                    <EmojiCategory
                      key={cat.id}
                      category={cat}
                      active={cat.id === emojiActiveId}
                      onSelect={() => setEmojiActiveId(cat.id)}
                    />
                  ))}
                </div>
                <div className="scrollbar-thin max-h-48 overflow-y-auto">
                  <EmojiGrid emojis={activeCategory.emojis} onSelect={handleReact} />
                </div>
              </div>
            ) : (
              <>
                {/* Quick emoji strip */}
                <div className="flex items-center justify-around border-b border-border px-3 py-3">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReact(emoji)}
                      className="text-xl leading-none transition-transform hover:scale-125 active:scale-95"
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowEmojiGrid(true)}
                    aria-label="More reactions"
                    className="flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="size-3.5" />
                  </button>
                </div>

                {/* Action list */}
                <div className="py-1">
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
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
