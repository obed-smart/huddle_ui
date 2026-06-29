"use client";

import { useRef } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Paperclip } from "@/components/ui/icons";
import { EmojiPicker } from "./EmojiPicker";
import { useChatStore } from "@/store/useChatStore";

interface ComposerActionsProps {
  conversationId: string;
  onEmojiSelect: (emoji: string) => void;
}

export function ComposerActions({ conversationId, onEmojiSelect }: ComposerActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendAttachment = useChatStore((s) => s.sendAttachment);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) sendAttachment(conversationId, file);
    event.target.value = "";
  }

  return (
    <div className="flex items-center gap-1">
      <IconButton label="Attach file" onClick={() => fileInputRef.current?.click()}>
        <Paperclip />
      </IconButton>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <EmojiPicker onSelect={onEmojiSelect} />
    </div>
  );
}
