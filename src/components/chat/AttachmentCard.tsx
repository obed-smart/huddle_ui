"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, ImageIcon, Mic, Pause, Play } from "@/components/ui/icons";
import { cn, formatDuration } from "@/lib/utils";
import type { Attachment } from "@/types";

const WAVEFORM_BARS = 28;
// Deterministic pseudo-random heights so the bars look natural but are stable
const BAR_HEIGHTS = Array.from({ length: WAVEFORM_BARS }, (_, i) =>
  20 + ((i * 37 + (i % 5) * 13) % 75)
);

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentCardProps {
  attachment: Attachment;
  isOwn: boolean;
}

function VoicePlayer({ attachment, isOwn }: AttachmentCardProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = attachment.durationSeconds ?? 0;
  const progress = duration > 0 ? elapsed / duration : 0;
  const filledBars = Math.round(progress * WAVEFORM_BARS);

  function togglePlay() {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      if (elapsed >= duration) setElapsed(0);
      setPlaying(true);
      const TICK = 100;
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + TICK / 1000;
          if (next >= duration) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setPlaying(false);
            return duration;
          }
          return next;
        });
      }, TICK);
    }
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const displayTime = playing || elapsed > 0
    ? formatDuration(elapsed)
    : formatDuration(duration);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-(--radius-md) px-3 py-2.5 min-w-[200px]",
        isOwn ? "bg-white/15" : "bg-surface"
      )}
    >
      {/* Play/Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-primary/10 hover:bg-primary/20 text-primary"
        )}
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}
      </button>

      {/* Waveform */}
      <div className="flex flex-1 items-center gap-px h-7">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-0.5 rounded-full transition-colors duration-75",
              i < filledBars
                ? isOwn ? "bg-white/90" : "bg-primary"
                : isOwn ? "bg-white/35" : "bg-muted-foreground/30"
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* Time */}
      <span className={cn(
        "shrink-0 min-w-[28px] text-right text-xs tabular-nums",
        isOwn ? "text-white/70" : "text-muted-foreground"
      )}>
        {displayTime}
      </span>
    </div>
  );
}

export function AttachmentCard({ attachment, isOwn }: AttachmentCardProps) {
  if (attachment.type === "image") {
    return (
      <div className="flex aspect-[4/3] w-56 items-center justify-center overflow-hidden rounded-(--radius-md) bg-muted">
        <ImageIcon className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (attachment.type === "voice") {
    return <VoicePlayer attachment={attachment} isOwn={isOwn} />;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-(--radius-md) px-3 py-2.5",
        isOwn ? "bg-white/15" : "bg-surface"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm)",
          isOwn ? "bg-white/15" : "bg-muted"
        )}
      >
        <FileText className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{attachment.name}</span>
        <span className="block text-xs opacity-70">{formatFileSize(attachment.size)}</span>
      </span>
      <Download className="size-4 shrink-0 opacity-70" />
    </div>
  );
}
