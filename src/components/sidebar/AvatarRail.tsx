"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { Plus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";
import { usePresence, usePresenceStore } from "@/store/usePresenceStore";
import { getUserById } from "@/lib/seed-data";
import { getConversationMemberNames, getOtherParticipantIds } from "@/lib/conversation-utils";
import type { Conversation } from "@/types";

export function AvatarRail() {
  const router = useRouter();
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const openModal = useUIStore((s) => s.openModal);
  const statuses = usePresenceStore((s) => s.statuses);

  const rail = conversations
    .filter((c) => {
      if (c.type === "group") return true;
      const otherId = getOtherParticipantIds(c)[0];
      return otherId ? (statuses[otherId] ?? "offline") === "online" : false;
    })
    .slice(0, 8);

  function handleSelect(id: string) {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  }

  return (
    <div className="px-5 pb-1 pt-4">
      <p className="mb-2.5 text-xs font-semibold text-muted-foreground">Online now</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openModal("search-users")}
          aria-label="Find people"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" />
        </button>

        <div className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {rail.map((conversation) => (
            <AvatarRailItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => handleSelect(conversation.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface AvatarRailItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function AvatarRailItem({ conversation, isActive, onClick }: AvatarRailItemProps) {
  const memberNames = getConversationMemberNames(conversation);
  const otherId = conversation.type === "dm" ? getOtherParticipantIds(conversation)[0] : undefined;
  const otherUser = otherId ? getUserById(otherId) : undefined;
  const otherStatus = usePresence(otherId);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full p-0.5 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "ring-2 ring-primary"
      )}
      aria-label={conversation.type === "group" ? conversation.name : otherUser?.name}
      aria-current={isActive}
    >
      {conversation.type === "group" ? (
        <GroupAvatar names={memberNames} size="md" />
      ) : (
        <Avatar name={otherUser?.name ?? "Unknown"} size="md" presence={otherStatus} pulse />
      )}
    </button>
  );
}
