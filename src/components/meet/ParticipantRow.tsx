import { Avatar } from "@/components/ui/avatar";
import { Crown, Hand, Mic, MicOff } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import type { MeetParticipant } from "@/types";

interface ParticipantRowProps {
  participant: MeetParticipant;
  onToggleMute?: () => void;
}

export function ParticipantRow({ participant, onToggleMute }: ParticipantRowProps) {
  const user = getUserById(participant.userId);
  const isSelf = participant.userId === CURRENT_USER_ID;
  const name = isSelf ? "You" : user?.name ?? "Unknown";

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar name={user?.name ?? "Unknown"} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{name}</span>
      {participant.role === "host" && <Crown className="size-3.5 shrink-0 text-amber-400" />}
      {participant.handRaised && <Hand className="size-3.5 shrink-0 text-amber-400" />}
      <button
        type="button"
        onClick={onToggleMute}
        disabled={!onToggleMute}
        aria-label={participant.muted ? `Unmute ${name}` : `Mute ${name}`}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          onToggleMute && "hover:bg-white/10 hover:text-white"
        )}
      >
        {participant.muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
      </button>
    </div>
  );
}
