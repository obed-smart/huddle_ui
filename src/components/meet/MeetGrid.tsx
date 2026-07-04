import { ParticipantTile } from "@/components/calls/ParticipantTile";
import { cn, getParticipantGridCols } from "@/lib/utils";
import type { MeetParticipant } from "@/types";

interface MeetGridProps {
  participants: MeetParticipant[];
  pinnedUserId?: string;
  onPinParticipant?: (userId: string | undefined) => void;
  layoutMode: "grid" | "speaker" | "fullscreen";
}

export function MeetGrid({ participants, pinnedUserId, onPinParticipant, layoutMode }: MeetGridProps) {
  const featured = participants.find((p) => p.userId === pinnedUserId) ?? participants[0];
  const others = participants.filter((p) => p.userId !== featured?.userId);

  // Fullscreen: single tile, no filmstrip
  if (layoutMode === "fullscreen" && featured) {
    return (
      <div className="h-full p-4 md:p-6">
        <ParticipantTile
          participant={featured}
          className="h-full w-full ring-2 ring-primary"
          isPinned
          onTogglePin={onPinParticipant ? () => onPinParticipant(undefined) : undefined}
        />
      </div>
    );
  }

  // Speaker: large featured tile + horizontal filmstrip
  if ((layoutMode === "speaker" || pinnedUserId) && featured) {
    return (
      <div className="flex h-full flex-col gap-3 p-4 md:p-6">
        <ParticipantTile
          participant={featured}
          className="min-h-0 flex-1 ring-2 ring-primary"
          isPinned
          onTogglePin={onPinParticipant ? () => onPinParticipant(undefined) : undefined}
        />
        {others.length > 0 && (
          <div className="scrollbar-thin flex shrink-0 gap-3 overflow-x-auto">
            {others.map((participant) => (
              <ParticipantTile
                key={participant.userId}
                participant={participant}
                className="aspect-video w-36 shrink-0"
                onTogglePin={onPinParticipant ? () => onPinParticipant(participant.userId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Grid: all participants equal size
  return (
    <div
      className={cn("grid h-full content-center gap-4 p-4 md:p-6", getParticipantGridCols(participants.length))}
    >
      {participants.map((participant) => (
        <ParticipantTile
          key={participant.userId}
          participant={participant}
          className="aspect-video"
          onTogglePin={onPinParticipant ? () => onPinParticipant(participant.userId) : undefined}
        />
      ))}
    </div>
  );
}
