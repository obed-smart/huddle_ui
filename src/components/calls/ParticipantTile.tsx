import { Avatar } from "@/components/ui/avatar";
import { Crown, Hand, MicOff } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import type { CallParticipant, MeetRole } from "@/types";

interface ParticipantTileProps {
  participant: CallParticipant & { role?: MeetRole; handRaised?: boolean };
  className?: string;
}

export function ParticipantTile({ participant, className }: ParticipantTileProps) {
  const user = getUserById(participant.userId);
  const name = participant.userId === CURRENT_USER_ID ? "You" : user?.name ?? "Unknown";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-(--radius-lg) bg-slate-800",
        participant.isSpeaking && "ring-2 ring-primary",
        className
      )}
    >
      <Avatar name={user?.name ?? "Unknown"} size="lg" />

      <div className="absolute left-2 top-2 flex items-center gap-1">
        {participant.role === "host" && (
          <span className="flex size-5 items-center justify-center rounded-full bg-slate-900/70 text-amber-400">
            <Crown className="size-3" />
          </span>
        )}
        {participant.handRaised && (
          <span className="flex size-5 items-center justify-center rounded-full bg-slate-900/70 text-amber-400">
            <Hand className="size-3" />
          </span>
        )}
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2 py-1 text-xs font-medium text-white">
        {participant.muted && <MicOff className="size-3" />}
        <span>{name}</span>
      </div>
    </div>
  );
}
