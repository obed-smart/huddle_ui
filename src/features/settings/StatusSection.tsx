"use client";

import { Dot } from "@/components/ui/dot";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";

const STATUS_OPTIONS: { value: PresenceStatus; label: string; description: string }[] = [
  { value: "online", label: "Online", description: "Visible and available for calls and messages" },
  { value: "away", label: "Away", description: "Signed in but not actively at your desk" },
  { value: "offline", label: "Offline", description: "Appear offline to others" },
];

export function StatusSection() {
  const { user, setStatus } = useAuthStore();

  if (!user) return null;

  return (
    <section className="space-y-4 rounded-(--radius-lg) border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">Status</h2>
      <div className="space-y-2">
        {STATUS_OPTIONS.map((option) => {
          const active = user.status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-3 rounded-(--radius-md) border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-primary bg-secondary" : "border-border hover:bg-surface-hover"
              )}
            >
              <Dot status={option.value} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
