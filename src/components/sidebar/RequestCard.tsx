"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserById } from "@/lib/seed-data";
import type { Ping } from "@/types";

interface RequestCardProps {
  request: Ping;
  onAccept: () => void;
  onDecline: () => void;
}

export function RequestCard({ request, onAccept, onDecline }: RequestCardProps) {
  const fromUser = getUserById(request.fromUserId);

  return (
    <div className="flex items-center gap-3 rounded-(--radius-md) px-3 py-2.5">
      <Avatar name={fromUser?.name ?? "Unknown"} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{fromUser?.name ?? "Unknown"}</span>
        <span className="block truncate text-sm text-muted-foreground">@{fromUser?.username}</span>
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={onDecline}>
          Decline
        </Button>
        <Button size="sm" onClick={onAccept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
