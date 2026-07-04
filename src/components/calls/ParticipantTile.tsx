import { Avatar } from "@/components/ui/avatar";
import { Crown, Hand, MicOff, Pin, PinOff } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import type { CallParticipant, MeetRole } from "@/types";

interface ParticipantTileProps {
  participant: CallParticipant & { role?: MeetRole; handRaised?: boolean };
  className?: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

function SpeakingWaveform() {
  return (
    <span className="flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 80}ms`, height: `${50 + (i % 2) * 30}%` }}
        />
      ))}
    </span>
  );
}

export function ParticipantTile({ participant, className, isPinned, onTogglePin }: ParticipantTileProps) {
  const user = getUserById(participant.userId);
  const name = participant.userId === CURRENT_USER_ID ? "You" : user?.name ?? "Unknown";

  return (
    <div
      onClick={onTogglePin}
      className={cn(
        "group/tile relative flex items-center justify-center overflow-hidden rounded-(--radius-lg) bg-slate-800",
        onTogglePin && "cursor-pointer",
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

      {/* Pin indicator — visible when pinned; hover-reveal on desktop */}
      {onTogglePin && (
        <div
          className={cn(
            "absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-white transition-opacity",
            isPinned ? "opacity-100" : "opacity-0 group-hover/tile:opacity-100"
          )}
          aria-hidden
        >
          {isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2 py-1 text-xs font-medium text-white">
        {participant.isSpeaking ? (
          <SpeakingWaveform />
        ) : (
          participant.muted && <MicOff className="size-3" />
        )}
        <span>{name}</span>
      </div>
    </div>
  );
}
