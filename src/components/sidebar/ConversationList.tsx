"use client";

import { useRouter } from "next/navigation";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "@/components/ui/icons";
import { useChatStore } from "@/store/useChatStore";
import { getConversationName } from "@/lib/conversation-utils";

interface ConversationListProps {
  query: string;
}

export function ConversationList({ query }: ConversationListProps) {
  const router = useRouter();
  const { conversations, activeConversationId, setActiveConversation, getLastMessage } = useChatStore();

  const filtered = conversations
    .filter((c) => getConversationName(c).toLowerCase().includes(query.trim().toLowerCase()))
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
