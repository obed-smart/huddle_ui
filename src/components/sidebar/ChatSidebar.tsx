"use client";

import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { AvatarRail } from "./AvatarRail";
import { ConversationList } from "./ConversationList";
import type { ChatFilter } from "./ConversationList";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: ChatFilter }[] = [
  { label: "All Chats", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Groups", value: "groups" },
];

export function ChatSidebar() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChatFilter>("all");

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-surface">
      <SidebarHeader />
      <AvatarRail />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-5 pb-2 pt-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search conversations" />
      </div>
      <ConversationList query={query} filter={filter} />
      <ProfileMenu />
    </aside>
  );
}
