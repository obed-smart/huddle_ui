"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Settings } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfileMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="mt-auto border-t border-border p-3">
      {/* Desktop: click navigates to settings */}
      <button
        type="button"
        onClick={() => router.push("/settings")}
        className="hidden w-full items-center gap-2.5 rounded-(--radius-md) p-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
      >
        <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" presence={user.status} />
        <span className="flex-1 text-sm font-medium text-foreground">{user.name}</span>
        <Settings className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Mobile: show user info only; Settings is in the bottom navigation */}
      <div className="flex items-center gap-2.5 p-2 md:hidden">
        <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" presence={user.status} />
        <span className="flex-1 truncate text-sm font-medium text-foreground">{user.name}</span>
      </div>
    </div>
  );
}
