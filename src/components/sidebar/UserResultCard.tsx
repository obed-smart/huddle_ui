"use client";

import { Avatar } from "@/components/ui/avatar";
import type { User } from "@/types";

interface UserResultCardProps {
  user: User;
  onClick: () => void;
}

export function UserResultCard({ user, onClick }: UserResultCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-(--radius-md) px-3 py-2.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar name={user.name} size="md" presence={user.status} pulse />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{user.name}</span>
        <span className="block truncate text-sm text-muted-foreground">@{user.username}</span>
      </span>
    </button>
  );
}
