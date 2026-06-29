import { Download, FileText, ImageIcon, Mic } from "@/components/ui/icons";
import { cn, formatDuration } from "@/lib/utils";
import type { Attachment } from "@/types";

interface AttachmentCardProps {
  attachment: Attachment;
  isOwn: boolean;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-(--radius-md) px-3 py-2.5",
          isOwn ? "bg-white/15" : "bg-surface"
        )}
      >
        <Mic className="size-4 shrink-0" />
        <div className="flex h-5 flex-1 items-center gap-0.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={cn("w-0.5 rounded-full", isOwn ? "bg-white/50" : "bg-muted-foreground/40")}
              style={{ height: `${20 + ((i * 13) % 60)}%` }}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs tabular-nums opacity-80">
          {formatDuration(attachment.durationSeconds ?? 0)}
        </span>
      </div>
    );
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
