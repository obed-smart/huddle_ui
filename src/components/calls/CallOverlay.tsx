"use client";

import { useRouter } from "next/navigation";
import { CallControls } from "./CallControls";
import { ParticipantTile } from "./ParticipantTile";
import { CallTimer } from "@/components/shared/CallTimer";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { getConversationName } from "@/lib/conversation-utils";
import { cn, getParticipantGridCols } from "@/lib/utils";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";

interface CallOverlayProps {
  conversationId: string;
}

export function CallOverlay({ conversationId }: CallOverlayProps) {
  const router = useRouter();
  const activeCall = useCallStore((s) => s.activeCall);
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));

  if (!activeCall) return null;

  const name = conversation ? getConversationName(conversation) : "Call";
  const gridCols = getParticipantGridCols(activeCall.participants.length);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
        <IconButton
          label="Minimize"
          variant="ghostOnDark"
          onClick={() => router.push(`/chat/${conversationId}`)}
        >
          <ArrowLeft />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <CallTimer startedAt={activeCall.startedAt} className="text-xs text-slate-400" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 md:p-8">
        <div className={cn("grid w-full max-w-4xl gap-4", gridCols)}>
          {activeCall.participants.map((participant) => (
            <ParticipantTile key={participant.userId} participant={participant} className="aspect-video" />
          ))}
        </div>
      </div>

      <CallControls conversationId={conversationId} />
    </div>
  );
}
