"use client";

import { useRouter } from "next/navigation";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "@/components/ui/icons";
import { useChatStore } from "@/store/useChatStore";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { getConversationName } from "@/lib/conversation-utils";

export type ChatFilter = "all" | "unread" | "groups";

interface ConversationListProps {
  query: string;
  filter?: ChatFilter;
}

export function ConversationList({ query, filter = "all" }: ConversationListProps) {
  const router = useRouter();
  const { conversations, activeConversationId, setActiveConversation, getLastMessage, getUnreadCount } = useChatStore();

  const filtered = conversations
    .filter((c) => {
      if (!c.participantIds.includes(CURRENT_USER_ID)) return false;
      if (!getConversationName(c).toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (filter === "groups") return c.type === "group";
      if (filter === "unread") return getUnreadCount(c.id) > 0;
      return true;
    })
    .sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      const aTime = getLastMessage(a.id)?.createdAt ?? "";
      const bTime = getLastMessage(b.id)?.createdAt ?? "";
      return bTime.localeCompare(aTime);
    });

  function handleSelect(id: string) {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<Search />}
        title="No conversations found"
        description={`No results for "${query}"`}
      />
    );
  }

  return (
    <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
      {filtered.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onClick={() => handleSelect(conversation.id)}
        />
      ))}
    </div>
  );
}
