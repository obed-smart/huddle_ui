"use client";

import { ParticipantRow } from "./ParticipantRow";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useMeetStore } from "@/store/useMeetStore";
import type { MeetParticipant } from "@/types";

interface MeetParticipantListProps {
  participants: MeetParticipant[];
}

export function MeetParticipantList({ participants }: MeetParticipantListProps) {
  const toggleParticipantMute = useMeetStore((s) => s.toggleParticipantMute);
  const isHost = participants.find((p) => p.userId === CURRENT_USER_ID)?.role === "host";

  return (
    <div className="divide-y divide-border">
      {participants.map((participant) => (
        <ParticipantRow
          key={participant.userId}
          participant={participant}
          onToggleMute={
            isHost && participant.userId !== CURRENT_USER_ID
              ? () => toggleParticipantMute(participant.userId)
              : undefined
          }
        />
      ))}
    </div>
  );
}
