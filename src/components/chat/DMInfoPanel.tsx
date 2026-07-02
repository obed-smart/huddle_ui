"use client";

import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dot } from "@/components/ui/dot";
import { getUserById } from "@/lib/seed-data";
import { usePresence } from "@/store/usePresenceStore";

interface DMInfoPanelProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DMInfoPanel({ userId, open, onOpenChange }: DMInfoPanelProps) {
  const user = getUserById(userId);
  const status = usePresence(userId);

  if (!user) return null;

  const statusLabel =
    status === "online" ? "Online" :
    status === "away" ? "Away" :
    status === "busy" ? "Do not disturb" : "Offline";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-3 border-b border-border px-6 pb-6 pt-8">
          <div className="relative">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size="xl" />
            <span className="absolute -bottom-0.5 -right-0.5">
              <Dot
                status={status ?? "offline"}
                size="lg"
                className="ring-2 ring-white"
              />
            </span>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              className={`size-2 rounded-full ${
                status === "online"
                  ? "bg-presence-online"
                  : status === "away"
                  ? "bg-presence-away"
                  : "bg-presence-offline"
              }`}
            />
            {statusLabel}
          </span>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-6 py-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
            <p className="text-sm text-foreground">{user.bio}</p>
          </div>
        )}

        {/* About */}
        {user.about && (
          <>
            <div className="mx-6 border-t border-border" />
            <div className="px-6 py-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</p>
              <p className="text-sm leading-relaxed text-foreground">{user.about}</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
