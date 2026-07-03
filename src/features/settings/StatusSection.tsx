"use client";

import { Dot } from "@/components/ui/dot";
import { useAuthStore } from "@/store/useAuthStore";
import type { PresenceStatus } from "@/types";

const STATUS_COPY: Record<PresenceStatus, { label: string; description: string }> = {
  online: { label: "Online", description: "Active and available for calls and messages" },
  away: { label: "Away", description: "Signed in, but inactive for a while" },
  busy: { label: "Busy", description: "Currently in a call or meeting" },
  offline: { label: "Offline", description: "Not currently signed in" },
};

export function StatusSection() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const { label, description } = STATUS_COPY[user.status];

  return (
    <section className="space-y-4 rounded-(--radius-lg) border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">Status</h2>
      <div className="flex items-center gap-3 rounded-(--radius-md) border border-border p-3">
        <Dot status={user.status} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">{label}</span>
          <span className="block text-xs text-muted-foreground">{description}</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Your status updates automatically based on your activity and whether you&apos;re in a call
        or meeting.
      </p>
    </section>
  );
}
