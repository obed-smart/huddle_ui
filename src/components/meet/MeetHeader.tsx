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
import { cn } from "@/lib/utils";
import { useMeetStore } from "@/store/useMeetStore";
import type { MeetSession } from "@/types";

interface MeetHeaderProps {
  meet: MeetSession;
  dark?: boolean;
}

export function MeetHeader({ meet, dark = false }: MeetHeaderProps) {
  const [locked, setLocked] = useState(false);
  const toggleParticipantMute = useMeetStore((s) => s.toggleParticipantMute);
  const isInstant = meet.conversationId === "instant";

  function handleMuteAll() {
    meet.participants.forEach((p) => {
      if (!p.muted) toggleParticipantMute(p.userId);
    });
  }

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 px-4 py-3 md:px-6",
        dark
          ? "border-b border-white/10 bg-transparent"
          : "border-b border-border bg-surface"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", dark ? "text-white" : "text-foreground")}>
          {meet.title}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 ring-1 ring-destructive/20">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            <CallTimer startedAt={meet.startedAt} className="text-[11px] font-semibold tabular-nums text-destructive" />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            dark ? "bg-white/15 text-white" : "bg-secondary text-secondary-foreground"
          )}
        >
          <Users className="size-3" />
          {meet.participants.length}
        </span>

        {isInstant && (
          <IconButton
            label="Share meeting link"
            variant={dark ? "ghostOnDark" : "default"}
          >
            <Share2 />
          </IconButton>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label="More options" variant={dark ? "ghostOnDark" : "default"}>
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
