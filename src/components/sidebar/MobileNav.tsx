"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessagesSquare, Video, Bell, Settings } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";

const DETAIL_ROUTE = /^\/(chat|meet)\/[^/]+/;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const openModal = useUIStore((s) => s.openModal);
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  if (DETAIL_ROUTE.test(pathname)) return null;

  const tabs = [
    {
      id: "chat",
      label: "Chats",
      icon: MessagesSquare,
      active: pathname.startsWith("/chat"),
      onClick: () => router.push("/chat"),
    },
    {
      id: "meet",
      label: "Meet",
      icon: Video,
      active: pathname.startsWith("/meet"),
      onClick: () => router.push("/meet"),
    },
    {
      id: "notifications",
      label: "Alerts",
      icon: Bell,
      active: activeModal === "notifications",
      onClick: () => openModal("notifications"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
      onClick: () => router.push("/settings"),
    },
  ];

  return (
    <nav className="flex items-center justify-around border-t border-border bg-surface py-2 md:hidden">
      {tabs.map(({ id, label, icon: Icon, active, onClick }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-current={active}
          className={cn(
            "flex flex-col items-center gap-1 rounded-(--radius-sm) px-4 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="relative">
            <Icon className="size-5" />
            {id === "notifications" && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 size-2 rounded-full bg-destructive" />
            )}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
