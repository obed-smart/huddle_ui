"use client";

import { useRouter } from "next/navigation";
import { CallTimer } from "@/components/shared/CallTimer";
import { Users } from "@/components/ui/icons";
import { useMeetStore } from "@/store/useMeetStore";

export function ActiveMeetBar() {
  const router = useRouter();
  const activeMeet = useMeetStore((s) => s.activeMeet);

  if (!activeMeet) return null;

  return (
    <button
      type="button"
      onClick={() => router.push(`/meet/${activeMeet.conversationId}`)}
      className="flex w-full shrink-0 items-center justify-between gap-3 bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Return to active meet"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" />
        Meet in progress
      </span>
      <CallTimer
        startedAt={activeMeet.startedAt}
        className="text-sm font-medium tabular-nums text-primary-foreground/90"
      />
    </button>
  );
}
