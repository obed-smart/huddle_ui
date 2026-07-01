"use client";

import { useRouter } from "next/navigation";
import { CallTimer } from "@/components/shared/CallTimer";
import { Phone, Video } from "@/components/ui/icons";
import { useCallStore } from "@/store/useCallStore";

export function ActiveCallBar() {
  const router = useRouter();
  const activeCall = useCallStore((s) => s.activeCall);

  if (!activeCall || activeCall.status !== "active") return null;

  const Icon = activeCall.type === "video" ? Video : Phone;

  return (
    <button
      type="button"
      onClick={() => router.push(`/call/${activeCall.conversationId}`)}
      className="flex w-full shrink-0 items-center justify-between gap-3 bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Return to active call"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" />
        {activeCall.type === "video" ? "Video call" : "Audio call"} in progress
      </span>
      <CallTimer
        startedAt={activeCall.startedAt ?? new Date().toISOString()}
        className="text-sm font-medium tabular-nums text-white/90"
      />
    </button>
  );
}
