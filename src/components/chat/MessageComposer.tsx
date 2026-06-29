"use client";

import { useRef, useState } from "react";
import { ComposerActions } from "./ComposerActions";
import { ComposerInput } from "./ComposerInput";
import { IconButton } from "@/components/ui/icon-button";
import { SendHorizontal } from "@/components/ui/icons";
import { useChatStore } from "@/store/useChatStore";

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useChatStore((s) => s.sendMessage);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(conversationId, text);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleEmojiSelect(emoji: string) {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-border px-4 py-3 md:px-6">
      <ComposerActions conversationId={conversationId} onEmojiSelect={handleEmojiSelect} />
      <ComposerInput
        ref={textareaRef}
        value={text}
        placeholder="Type a message"
        onChange={(e) => {
          setText(e.target.value);
          resize(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <IconButton label="Send message" variant="primary" onClick={handleSend} disabled={!text.trim()}>
        <SendHorizontal />
      </IconButton>
    </div>
  );
}
