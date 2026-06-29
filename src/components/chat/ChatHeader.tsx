"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, Phone, Pin, PinOff, Video } from "@/components/ui/icons";
import {
  getConversationMemberNames,
  getConversationName,
  getConversationStatusLine,
  getOtherParticipantIds,
} from "@/lib/conversation-utils";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";
import { usePresence } from "@/store/usePresenceStore";
import type { Conversation } from "@/types";

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const router = useRouter();
  const togglePin = useChatStore((s) => s.togglePin);
  const startCall = useCallStore((s) => s.startCall);

  const otherId = conversation.type === "dm" ? getOtherParticipantIds(conversation)[0] : undefined;
  const otherStatus = usePresence(otherId);

  const name = getConversationName(conversation);
  const statusLine = getConversationStatusLine(conversation, otherStatus);
  const memberNames = getConversationMemberNames(conversation);

  function handleCall(type: "audio" | "video") {
    startCall(conversation.id, conversation.participantIds, type);
    router.push(`/meet/${conversation.id}`);
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:px-6">
      <IconButton label="Back" className="md:hidden" onClick={() => router.push("/chat")}>
        <ArrowLeft />
      </IconButton>

      {conversation.type === "group" ? (
        <GroupAvatar names={memberNames} size="sm" />
      ) : (
        <Avatar name={name} size="sm" presence={otherStatus} />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{statusLine}</p>
      </div>

      <IconButton label="Audio call" onClick={() => handleCall("audio")}>
        <Phone />
      </IconButton>
      <IconButton label="Video call" onClick={() => handleCall("video")}>
        <Video />
      </IconButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="More options">
            <MoreVertical />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => togglePin(conversation.id)}>
            {conversation.pinned ? <PinOff /> : <Pin />}
            {conversation.pinned ? "Unpin conversation" : "Pin conversation"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
