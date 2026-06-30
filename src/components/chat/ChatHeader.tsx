"use client";

import { useState } from "react";
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
import { ArrowLeft, MoreVertical, Phone, Pin, PinOff, Users, Video } from "@/components/ui/icons";
import { GroupInfoPanel } from "./GroupInfoPanel";
import {
  getConversationMemberNames,
  getConversationName,
  getConversationStatusLine,
  getOtherParticipantIds,
} from "@/lib/conversation-utils";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";
import { useMeetStore } from "@/store/useMeetStore";
import { usePresence } from "@/store/usePresenceStore";
import type { Conversation } from "@/types";

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const router = useRouter();
  const [infoOpen, setInfoOpen] = useState(false);
  const togglePin = useChatStore((s) => s.togglePin);
  const addMeetMessage = useChatStore((s) => s.addMeetMessage);
  const startCall = useCallStore((s) => s.startCall);
  const startMeet = useMeetStore((s) => s.startMeet);

  const otherId = conversation.type === "dm" ? getOtherParticipantIds(conversation)[0] : undefined;
  const otherStatus = usePresence(otherId);

  const name = getConversationName(conversation);
  const statusLine = getConversationStatusLine(conversation, otherStatus);
  const memberNames = getConversationMemberNames(conversation);

  function handleCall(type: "audio" | "video") {
    startCall(conversation.id, conversation.participantIds, type);
    router.push(`/call/${conversation.id}`);
  }

  function handleMeet() {
    const meetId = startMeet(
      name,
      conversation.participantIds.map((userId) => ({
        userId,
        muted: false,
        cameraOff: false,
        role: userId === CURRENT_USER_ID ? "host" : "member",
      }))
    );
    addMeetMessage(conversation.id, { meetId, title: name, startedBy: CURRENT_USER_ID });
    router.push(`/meet/${conversation.id}`);
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:px-6">
      <IconButton label="Back" className="md:hidden" onClick={() => router.push("/chat")}>
        <ArrowLeft />
      </IconButton>

      {conversation.type === "group" ? (
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-(--radius-md) text-left transition-opacity hover:opacity-80"
        >
          <GroupAvatar names={memberNames} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">{statusLine}</span>
          </span>
        </button>
      ) : (
        <>
          <Avatar name={name} size="sm" presence={otherStatus} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{statusLine}</p>
          </div>
        </>
      )}

      <div className="hidden items-center gap-1 md:flex">
        <IconButton label="Audio call" onClick={() => handleCall("audio")}>
          <Phone />
        </IconButton>
        <IconButton label="Video call" onClick={() => handleCall("video")}>
          <Video />
        </IconButton>
        <IconButton label="Start meet" onClick={handleMeet}>
          <Users />
        </IconButton>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Start call or meet" className="md:hidden">
            <Phone />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleCall("audio")}>
            <Phone />
            Audio call
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleCall("video")}>
            <Video />
            Video call
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleMeet}>
            <Users />
            Meet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      {conversation.type === "group" && (
        <GroupInfoPanel conversation={conversation} open={infoOpen} onOpenChange={setInfoOpen} />
      )}
    </header>
  );
}
