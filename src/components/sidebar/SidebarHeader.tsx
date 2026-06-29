"use client";

import { IconButton } from "@/components/ui/icon-button";
import { SquarePen } from "@/components/ui/icons";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useUIStore } from "@/store/useUIStore";

export function SidebarHeader() {
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-(--radius-sm) bg-primary font-heading text-sm font-bold text-primary-foreground">
          H
        </div>
        <span className="font-heading text-lg font-semibold text-foreground">Huddle</span>
      </div>
      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <IconButton label="Start a new chat" onClick={() => openModal("search-users")}>
          <SquarePen />
        </IconButton>
      </div>
    </div>
  );
}
