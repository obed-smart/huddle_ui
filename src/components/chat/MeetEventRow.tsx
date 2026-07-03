"use client";

import { useRouter } from "next/navigation";
import { Users, Video } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { formatTimestamp } from "@/lib/utils";
import { useMeetStore } from "@/store/useMeetStore";
import type { Message } from "@/types";

interface MeetEventRowProps {
  message: Message;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function MeetEventRow({ message }: MeetEventRowProps) {
  const router = useRouter();
  const activeMeetId = useMeetStore((s) => s.activeMeet?.id);
  const event = message.meet;
  if (!event) return null;

  const starter = getUserById(event.startedBy);
  const label =
    event.startedBy === CURRENT_USER_ID ? "You started a meet" : `${starter?.name ?? "Someone"} started a meet`;

  const isActive = !event.endedAt && activeMeetId === event.meetId;
  const isEnded = !!event.endedAt;

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <Users className="size-3.5" />
        {label}
        <span className="text-muted-foreground/70">· {formatTimestamp(message.createdAt)}</span>
      </span>
      {isActive ? (
        <button
          type="button"
          onClick={() => router.push(`/meet/${message.conversationId}`)}
          className="rounded-(--radius-sm) bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Join now
        </button>
      ) : (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Video className="size-3.5" />
          Meet ended
          {isEnded && event.durationSeconds != null && (
            <span>· {formatDuration(event.durationSeconds)}</span>
          )}
        </span>
      )}
    </div>
  );
}
