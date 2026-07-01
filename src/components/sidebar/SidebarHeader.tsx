"use client";

import { Avatar } from "@/components/ui/avatar";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { usePendingIncomingRequests } from "@/store/useConversationRequestStore";

export function SidebarHeader() {
  const openModal = useUIStore((s) => s.openModal);
  const incoming = usePendingIncomingRequests();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-5">
      <div className="flex items-center gap-2.5">
        <Avatar
          name={user?.name ?? "Me"}
          imageUrl={user?.avatarUrl}
          size="sm"
          presence={user?.status ?? "online"}
        />
        <span className="font-heading text-lg font-semibold text-foreground">{user?.name ?? "Huddle"}</span>
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
