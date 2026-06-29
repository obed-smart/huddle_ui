"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { Plus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";
import { getUserById } from "@/lib/seed-data";
import { getConversationMemberNames, getOtherParticipantIds } from "@/lib/conversation-utils";

export function AvatarRail() {
  const router = useRouter();
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const openModal = useUIStore((s) => s.openModal);
  const rail = conversations.slice(0, 7);

  function handleSelect(id: string) {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  }

  return (
    <div className="scrollbar-thin flex items-center gap-3 overflow-x-auto px-5 pb-1 pt-4">
      <button
        type="button"
        onClick={() => openModal("search-users")}
        aria-label="Find people"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-4" />
      </button>

      {rail.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const memberNames = getConversationMemberNames(conversation);
        const otherId = getOtherParticipantIds(conversation)[0];
        const otherUser = getUserById(otherId);

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => handleSelect(conversation.id)}
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
              <Avatar
                name={otherUser?.name ?? "Unknown"}
                size="md"
                presence={otherUser?.status}
                pulse
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
