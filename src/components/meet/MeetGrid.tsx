import { ParticipantTile } from "@/components/calls/ParticipantTile";
import { cn, getParticipantGridCols } from "@/lib/utils";
import type { MeetParticipant } from "@/types";

interface MeetGridProps {
  participants: MeetParticipant[];
  pinnedUserId?: string;
}

export function MeetGrid({ participants, pinnedUserId }: MeetGridProps) {
  const pinned = participants.find((p) => p.userId === pinnedUserId);
  const others = pinned ? participants.filter((p) => p.userId !== pinnedUserId) : participants;

  if (pinned) {
    return (
      <div className="flex h-full flex-col gap-3 p-4 md:p-6">
        <ParticipantTile participant={pinned} className="min-h-0 flex-1" />
        <div className="scrollbar-thin flex shrink-0 gap-3 overflow-x-auto">
          {others.map((participant) => (
            <ParticipantTile
              key={participant.userId}
              participant={participant}
              className="aspect-video w-36 shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("grid h-full content-center gap-4 p-4 md:p-6", getParticipantGridCols(others.length))}
    >
      {others.map((participant) => (
        <ParticipantTile key={participant.userId} participant={participant} className="aspect-video" />
      ))}
    </div>
  );
}
