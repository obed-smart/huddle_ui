"use client";

import { useState } from "react";
import { CallTimer } from "@/components/shared/CallTimer";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, Mic, MicOff, MoreHorizontal, Share2, Users } from "@/components/ui/icons";
import { useMeetStore } from "@/store/useMeetStore";
import type { MeetSession } from "@/types";

interface MeetHeaderProps {
  meet: MeetSession;
}

export function MeetHeader({ meet }: MeetHeaderProps) {
  const [locked, setLocked] = useState(false);
  const toggleParticipantMute = useMeetStore((s) => s.toggleParticipantMute);
  const isInstant = meet.conversationId === "instant";

  function handleMuteAll() {
    meet.participants.forEach((p) => {
      if (!p.muted) toggleParticipantMute(p.userId);
    });
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{meet.title}</p>
        <div className="flex items-center gap-2 pt-0.5">
          {/* Live recording indicator pill */}
          <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 ring-1 ring-destructive/20">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            <CallTimer startedAt={meet.startedAt} className="text-[11px] font-semibold tabular-nums text-destructive" />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* Participant count badge */}
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
          <Users className="size-3" />
          {meet.participants.length}
        </span>

        {isInstant && (
          <IconButton label="Share meeting link">
            <Share2 />
          </IconButton>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label="More options">
              <MoreHorizontal />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleMuteAll}>
              <MicOff />
              Mute all participants
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLocked((v) => !v)}>
              {locked ? <Mic /> : <Lock />}
              {locked ? "Unlock meeting" : "Lock meeting"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
