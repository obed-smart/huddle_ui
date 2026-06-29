"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { usePresence } from "@/store/usePresenceStore";
import { useRelation } from "@/store/useConversationRequestStore";
import type { User } from "@/types";

interface UserResultCardProps {
  user: User;
  onClick: () => void;
}

export function UserResultCard({ user, onClick }: UserResultCardProps) {
  const status = usePresence(user.id);
  const relation = useRelation(user.id);
  const isPending = relation === "pending";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "flex w-full items-center gap-3 rounded-(--radius-md) px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isPending ? "cursor-default opacity-60" : "hover:bg-surface-hover"
      )}
    >
      <Avatar name={user.name} size="md" presence={status} pulse />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{user.name}</span>
        <span className="block truncate text-sm text-muted-foreground">@{user.username}</span>
      </span>
      {relation === "none" && (
        <span className="shrink-0 text-xs font-medium text-primary">Request</span>
      )}
      {isPending && <span className="shrink-0 text-xs font-medium text-muted-foreground">Pending</span>}
    </button>
  );
}
