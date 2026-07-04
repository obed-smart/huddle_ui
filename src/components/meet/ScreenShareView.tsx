import { ParticipantTile } from "@/components/calls/ParticipantTile";
import { ScreenShare } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import type { MeetSession } from "@/types";

interface ScreenShareViewProps {
  meet: MeetSession;
  isLandscape?: boolean;
  onPinParticipant?: (userId: string | undefined) => void;
}

export function ScreenShareView({ meet, isLandscape, onPinParticipant }: ScreenShareViewProps) {
  const presenterId = meet.screenSharingUserId;
  const presenter = presenterId ? getUserById(presenterId) : undefined;
  const isSelf = presenterId === CURRENT_USER_ID;
  const presenterName = isSelf ? "You" : presenter?.name ?? "Someone";
  const others = meet.participants;

  return (
    <div className={cn("flex h-full gap-3 p-3", isLandscape ? "flex-row" : "flex-col")}>
      {/* Shared screen placeholder */}
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-(--radius-lg) border border-dashed border-border/40 bg-slate-900/80 text-muted-foreground",
        isLandscape ? "min-w-0 flex-1" : "min-h-0 flex-1"
      )}>
        <ScreenShare className="size-8 text-slate-400" />
        <p className="text-sm text-slate-400">
          {isSelf ? "You are sharing your screen" : `${presenterName} is sharing their screen`}
        </p>
      </div>

      {/* Participant tiles */}
      <div className={cn(
        "scrollbar-thin flex gap-2",
        isLandscape
          ? "w-36 shrink-0 flex-col overflow-y-auto"
          : "shrink-0 flex-row overflow-x-auto pb-1"
      )}>
        {others.map((participant) => (
          <ParticipantTile
            key={participant.userId}
            participant={participant}
            className={cn(
              "shrink-0",
              isLandscape ? "aspect-video w-full" : "aspect-video w-32"
            )}
            onTogglePin={onPinParticipant ? () => onPinParticipant(participant.userId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
