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
import { RequestsButton } from "./RequestsButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useTotalPendingCount } from "@/store/useConversationRequestStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function SidebarHeader() {
  const openModal = useUIStore((s) => s.openModal);
  const activeModal = useUIStore((s) => s.activeModal);
  const totalPending = useTotalPendingCount();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-5">
      <button
        type="button"
        onClick={() => openModal("settings")}
        className="rounded-full transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Your profile and settings"
      >
        <Avatar
          name={user?.name ?? "Me"}
          imageUrl={user?.avatarUrl}
          size="sm"
          presence={user?.status ?? "online"}
        />
      </button>
      <div className="flex items-center gap-1">
        <RequestsButton count={totalPending} onClick={() => openModal("pings")} />
        {/* Bell hidden on mobile — Alerts tab in bottom nav handles notifications there */}
        <span className="hidden md:block">
          <NotificationBell
            unreadCount={unreadCount}
            active={activeModal === "notifications"}
            onClick={() => openModal("notifications")}
          />
        </span>
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
