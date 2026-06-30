"use client";

import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link2, SquarePen, UserPlus, Users } from "@/components/ui/icons";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { RequestsButton } from "./RequestsButton";
import { useUIStore } from "@/store/useUIStore";
import { usePendingIncomingRequests } from "@/store/useConversationRequestStore";

export function SidebarHeader() {
  const openModal = useUIStore((s) => s.openModal);
  const incoming = usePendingIncomingRequests();

  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-(--radius-sm) bg-primary font-heading text-sm font-bold text-primary-foreground">
          H
        </div>
        <span className="font-heading text-lg font-semibold text-foreground">Huddle</span>
      </div>
      <div className="flex items-center gap-1">
        <RequestsButton count={incoming.length} onClick={() => openModal("pings")} />
        <NotificationDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label="New">
              <SquarePen />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openModal("search-users")}>
              <UserPlus />
              New chat
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openModal("create-group")}>
              <Users />
              New group
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openModal("join-group")}>
              <Link2 />
              Join group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
