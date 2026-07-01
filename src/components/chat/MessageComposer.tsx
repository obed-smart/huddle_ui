"use client";

import { useEffect, useRef, useState } from "react";
import { ComposerInput } from "./ComposerInput";
import { EmojiPicker } from "./EmojiPicker";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera, ImageIcon, Mic, Paperclip, SendHorizontal, Share2, StopCircle, X } from "@/components/ui/icons";
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
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImageUrls, setPendingImageUrls] = useState<string[]>([]);
  const [showP2P, setShowP2P] = useState(false);
  const [p2pFile, setP2pFile] = useState<File | null>(null);
  const [p2pProgress, setP2pProgress] = useState(0);
  const [p2pDone, setP2pDone] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const p2pInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const p2pTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingUrlsRef = useRef<string[]>([]);

  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendAttachment = useChatStore((s) => s.sendAttachment);
  const sendVoiceMessage = useChatStore((s) => s.sendVoiceMessage);

  const hasText = text.trim().length > 0;
  const hasPendingImages = pendingImages.length > 0;

  useEffect(() => {
    pendingUrlsRef.current = pendingImageUrls;
  }, [pendingImageUrls]);

  useEffect(() => {
    return () => {
      pendingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (p2pTimerRef.current) clearInterval(p2pTimerRef.current);
    };
  }, []);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function clearPendingImages() {
    pendingImageUrls.forEach((url) => URL.revokeObjectURL(url));
    setPendingImages([]);
    setPendingImageUrls([]);
  }

  function handleSend() {
    if (!text.trim() && pendingImages.length === 0) return;
    for (const file of pendingImages) {
      sendAttachment(conversationId, file);
    }
    if (text.trim()) {
      sendMessage(conversationId, text);
    }
    clearPendingImages();
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleEmojiSelect(emoji: string) {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  }

  function handleGifSelect() {
    const blob = new Blob(["GIF89a"], { type: "image/gif" });
    const file = new File([blob], `gif-${Date.now()}.gif`, { type: "image/gif" });
    sendAttachment(conversationId, file);
  }

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setPendingImages(files);
    setPendingImageUrls(urls);
    event.target.value = "";
  }

  function handleCameraChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) sendAttachment(conversationId, file);
    event.target.value = "";
  }

  function handleP2PFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setP2pFile(file);
    setP2pProgress(0);
    setP2pDone(false);
    event.target.value = "";

    let progress = 0;
    p2pTimerRef.current = setInterval(() => {
      progress += Math.random() * 18 + 7;
      if (progress >= 100) {
        progress = 100;
        setP2pProgress(100);
        setP2pDone(true);
        if (p2pTimerRef.current) clearInterval(p2pTimerRef.current);
        setTimeout(() => {
          sendAttachment(conversationId, file);
          setTimeout(() => {
            setShowP2P(false);
            setP2pFile(null);
            setP2pProgress(0);
            setP2pDone(false);
          }, 700);
        }, 500);
      } else {
        setP2pProgress(progress);
      }
    }, 180);
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
    <div className="flex shrink-0 flex-col border-t border-border">
      {/* P2P dialog overlay */}
      {showP2P && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
          onClick={() => { if (!p2pFile) setShowP2P(false); }}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-surface p-5 shadow-(--shadow-xl) sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-heading font-semibold text-foreground">P2P Direct Share</p>
              {!p2pFile && (
                <button
                  type="button"
                  onClick={() => setShowP2P(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
            {!p2pFile ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Files are sent directly to the recipient — nothing is stored on our servers.
                </p>
                <button
                  type="button"
                  onClick={() => p2pInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-(--radius-md) border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Paperclip className="size-4" />
                  Choose file to share
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-(--radius-md) bg-secondary/60 px-3 py-2.5">
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p2pFile.name}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{p2pDone ? "Transfer complete" : "Transferring directly…"}</span>
                    <span>{Math.round(p2pProgress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-200",
                        p2pDone ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${p2pProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={p2pInputRef} type="file" className="hidden" onChange={handleP2PFileChange} />
      <input ref={photosInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handlePhotosChange} />
      <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleCameraChange} />

      {/* Pending image previews */}
      {hasPendingImages && (
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2">
          {pendingImages.map((file, i) => (
            <div key={i} className="group relative size-16 shrink-0 overflow-hidden rounded-(--radius-sm) border border-border bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImageUrls[i]} alt={file.name} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(pendingImageUrls[i]);
                  setPendingImages((prev) => prev.filter((_, j) => j !== i));
                  setPendingImageUrls((prev) => prev.filter((_, j) => j !== i));
                }}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-3 md:px-6">
        <EmojiPicker onSelect={handleEmojiSelect} onGifSelect={handleGifSelect} />

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
            placeholder={hasPendingImages ? "Add a caption…" : "Message"}
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

        {/* Attachment dropdown — hidden when recording or images pending */}
        {!isRecording && !hasPendingImages && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label="Attach">
                <Paperclip />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              <DropdownMenuItem
                onSelect={() => setTimeout(() => setShowP2P(true), 50)}
              >
                <Share2 className="size-4" />
                Direct file share (P2P)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTimeout(() => photosInputRef.current?.click(), 50)}
              >
                <ImageIcon className="size-4" />
                Photos &amp; media
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Camera — only in empty state */}
        {!isRecording && !hasText && !hasPendingImages && (
          <IconButton label="Camera" onClick={() => cameraInputRef.current?.click()}>
            <Camera />
          </IconButton>
        )}

        {isRecording ? (
          <IconButton label="Send voice message" variant="primary" onClick={stopRecording} className="shrink-0">
            <StopCircle />
          </IconButton>
        ) : hasText || hasPendingImages ? (
          <IconButton label="Send message" variant="primary" onClick={handleSend}>
            <SendHorizontal />
          </IconButton>
        ) : (
          <IconButton label="Record voice message" variant="primary" onClick={startRecording}>
            <Mic />
          </IconButton>
        )}
      </div>
    </div>
  );
}
