"use client";

import { useEffect, useRef, useState } from "react";
import { ComposerInput } from "./ComposerInput";
import { EmojiPicker } from "./EmojiPicker";
import { IconButton } from "@/components/ui/icon-button";
import { Camera, Mic, Paperclip, SendHorizontal, StopCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";

interface MessageComposerProps {
  conversationId: string;
}

function formatRecordingTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendAttachment = useChatStore((s) => s.sendAttachment);
  const sendVoiceMessage = useChatStore((s) => s.sendVoiceMessage);

  const hasText = text.trim().length > 0;

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

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

  function handleGifSelect() {
    // Simulate sending a GIF as an image attachment
    const blob = new Blob(["GIF89a"], { type: "image/gif" });
    const file = new File([blob], `gif-${Date.now()}.gif`, { type: "image/gif" });
    sendAttachment(conversationId, file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) sendAttachment(conversationId, file);
    event.target.value = "";
  }

  function handleCameraChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) sendAttachment(conversationId, file);
    event.target.value = "";
  }

  function startRecording() {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  }

  function stopRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const duration = recordingSeconds;
    setIsRecording(false);
    setRecordingSeconds(0);
    if (duration > 0) {
      sendVoiceMessage(conversationId, duration);
    }
  }

  function cancelRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-border px-4 py-3 md:px-6">
      {/* Left: emoji/GIF picker */}
      <EmojiPicker onSelect={handleEmojiSelect} onGifSelect={handleGifSelect} />

      {/* Middle: text input or recording indicator */}
      {isRecording ? (
        <div className="flex min-h-11 flex-1 items-center gap-2.5 rounded-(--radius-md) border border-destructive/30 bg-destructive/5 px-3 py-2">
          <span className="size-2.5 animate-pulse rounded-full bg-destructive" />
          <span className="flex-1 text-sm font-medium tabular-nums text-destructive">
            {formatRecordingTime(recordingSeconds)}
          </span>
          <button
            type="button"
            onClick={cancelRecording}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <ComposerInput
          ref={textareaRef}
          value={text}
          placeholder="Message"
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
      )}

      {/* Right of input: paperclip + camera (only when not typing/recording), then mic/send */}
      {!isRecording && !hasText && (
        <>
          <IconButton label="Attach file" onClick={() => fileInputRef.current?.click()}>
            <Paperclip />
          </IconButton>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          <IconButton label="Camera" onClick={() => cameraInputRef.current?.click()}>
            <Camera />
          </IconButton>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraChange}
          />
        </>
      )}

      {!isRecording && hasText && (
        <>
          <IconButton label="Attach file" onClick={() => fileInputRef.current?.click()}>
            <Paperclip />
          </IconButton>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        </>
      )}

      {/* Mic or Send */}
      {isRecording ? (
        <IconButton
          label="Send voice message"
          variant="primary"
          onClick={stopRecording}
          className={cn("shrink-0")}
        >
          <StopCircle />
        </IconButton>
      ) : hasText ? (
        <IconButton label="Send message" variant="primary" onClick={handleSend}>
          <SendHorizontal />
        </IconButton>
      ) : (
        <IconButton
          label="Record voice message"
          variant="primary"
          onClick={startRecording}
        >
          <Mic />
        </IconButton>
      )}
    </div>
  );
}
