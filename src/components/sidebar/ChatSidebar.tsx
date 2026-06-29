"use client";

import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { AvatarRail } from "./AvatarRail";
import { ConversationList } from "./ConversationList";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProfileMenu } from "@/components/profile/ProfileMenu";

export function ChatSidebar() {
  const [query, setQuery] = useState("");

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-surface">
      <SidebarHeader />
      <AvatarRail />
      <div className="px-5 pb-3 pt-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search conversations" />
      </div>
      <ConversationList query={query} />
      <ProfileMenu />
    </aside>
  );
}
