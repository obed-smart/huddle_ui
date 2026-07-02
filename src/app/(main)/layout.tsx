"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ActiveCallBar } from "@/components/calls/ActiveCallBar";
import { ActiveMeetBar } from "@/components/calls/ActiveMeetBar";
import { IncomingCallModal } from "@/components/calls/IncomingCallModal";
import { ChatSidebar } from "@/components/sidebar/ChatSidebar";
import { ConversationRequestsModal } from "@/components/sidebar/ConversationRequestsModal";
import { CreateGroupModal } from "@/components/sidebar/CreateGroupModal";
import { JoinGroupModal } from "@/components/sidebar/JoinGroupModal";
import { MobileNav } from "@/components/sidebar/MobileNav";
import { SearchUsersModal } from "@/components/sidebar/SearchUsersModal";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { PushToast } from "@/components/notifications/PushToast";
import { UsernameModal } from "@/features/auth/UsernameModal";
import { SettingsSheet } from "@/features/settings/SettingsSheet";
import { useAuthStore } from "@/store/useAuthStore";
import { usePresenceSimulator } from "@/store/usePresenceSimulator";
import { useNotificationsSimulator } from "@/store/useNotificationsSimulator";
import { cn } from "@/lib/utils";

const SIDEBAR_ONLY_ROUTE = /^\/chat\/?$/;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isDetail = !SIDEBAR_ONLY_ROUTE.test(pathname);

  usePresenceSimulator(hasHydrated && isAuthenticated);
  useNotificationsSimulator(hasHydrated && isAuthenticated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/login");
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <div className="flex h-dvh flex-col">
      <ActiveCallBar />
      <ActiveMeetBar />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "w-full shrink-0 border-r border-border md:flex md:w-[360px]",
            isDetail ? "hidden" : "flex"
          )}
        >
          <ChatSidebar />
        </div>
        <main className={cn("flex-1 overflow-hidden", isDetail ? "flex" : "hidden md:flex")}>
          {children}
        </main>
      </div>
      <MobileNav />
      <PushToast />
      <UsernameModal />
      <SearchUsersModal />
      <ConversationRequestsModal />
      <CreateGroupModal />
      <JoinGroupModal />
      <IncomingCallModal />
      <NotificationDropdown />
      <SettingsSheet />
    </div>
  );
}
