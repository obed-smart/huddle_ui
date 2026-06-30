"use client";

import { useRouter } from "next/navigation";
import { Video } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

interface MeetEventRowProps {
  message: Message;
}

export function MeetEventRow({ message }: MeetEventRowProps) {
  const router = useRouter();
  const event = message.meet;
  if (!event) return null;

  const starter = getUserById(event.startedBy);
  const label =
    event.startedBy === CURRENT_USER_ID ? "You started a meet" : `${starter?.name ?? "Someone"} started a meet`;

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <Video className="size-3.5" />
        {label}
        <span className="text-muted-foreground/70">· {formatTimestamp(message.createdAt)}</span>
      </span>
      <button
        type="button"
        onClick={() => router.push(`/meet/${message.conversationId}`)}
        className="rounded-(--radius-sm) bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Join now
      </button>
    </div>
  );
}
