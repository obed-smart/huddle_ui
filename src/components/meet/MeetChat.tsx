"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { SendHorizontal } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/utils";

interface MeetChatMessage {
  id: string;
  text: string;
  createdAt: string;
}

export function MeetChat() {
  const [messages, setMessages] = useState<MeetChatMessage[]>([]);
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: `mc-${Date.now()}`, text: text.trim(), createdAt: new Date().toISOString() }]);
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2">
              <Avatar name="You" size="xs" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-white">You</span>
                  <span className="text-[10px] text-slate-500">{formatTimestamp(message.createdAt)}</span>
                </div>
                <p className="break-words text-sm text-slate-200">{message.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Send a message"
          className="flex-1 rounded-(--radius-sm) bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <IconButton label="Send" variant="ghostOnDark" size="sm" onClick={handleSend} disabled={!text.trim()}>
          <SendHorizontal className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
