"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "@/components/ui/icons";
import { getUserById } from "@/lib/seed-data";
import type { GroupInvite } from "@/types";

interface GroupInviteCardProps {
  invite: GroupInvite;
  onAccept: () => void;
  onDecline: () => void;
}

export function GroupInviteCard({ invite, onAccept, onDecline }: GroupInviteCardProps) {
  const fromUser = getUserById(invite.fromUserId);

  return (
    <div className="flex items-center gap-3 rounded-(--radius-md) px-3 py-2.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Users className="size-4 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{invite.groupName}</span>
        <span className="block truncate text-sm text-muted-foreground">
          Invited by {fromUser?.name ?? "Someone"}
        </span>
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={onDecline}>
          Decline
        </Button>
        <Button size="sm" onClick={onAccept}>
          Join
        </Button>
      </div>
    </div>
  );
}
