"use client";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { SendHorizontal } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useMeetStore } from "@/store/useMeetStore";
import { useRef, useEffect, useState } from "react";

export function MeetChat() {
  const messages = useMeetStore((s) => s.meetChatMessages);
  const sendMeetChatMessage = useMeetStore((s) => s.sendMeetChatMessage);
  const devSimulateMeetChat = useMeetStore((s) => s.devSimulateMeetChat);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleSend() {
    if (!text.trim()) return;
    sendMeetChatMessage(text.trim());
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === CURRENT_USER_ID;
            const sender = isOwn ? null : getUserById(message.senderId);
            const name = isOwn ? "You" : (sender?.name ?? "Participant");
            return (
              <div key={message.id} className="flex items-start gap-2">
                <Avatar name={name} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-foreground">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTimestamp(message.createdAt)}</span>
                  </div>
                  <p className="break-words text-sm text-foreground">{message.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Dev: sim incoming message */}
      <div className="flex justify-end px-3 pb-0.5">
        <button
          type="button"
          onClick={devSimulateMeetChat}
          className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-primary/70 hover:bg-secondary hover:text-primary"
        >
          Sim message
        </button>
      </div>

      <div className="flex items-center gap-2 border-t border-border p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Send a message"
          className="flex-1 rounded-(--radius-sm) bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <IconButton label="Send" size="sm" onClick={handleSend} disabled={!text.trim()}>
          <SendHorizontal className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
