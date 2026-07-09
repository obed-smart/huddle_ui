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
    <span className="flex items-end gap-[2px]" style={{ height: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-emerald-400 animate-(--animate-voice-bar)"
          style={{ animationDelay: `${i * 90}ms`, height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
}

export function ParticipantTile({ participant, className, isPinned, onTogglePin }: ParticipantTileProps) {
  const user = getUserById(participant.userId);
  const name = participant.userId === CURRENT_USER_ID ? "You" : user?.name ?? "Unknown";
  const isCalling = participant.callStatus === "calling";

  return (
    <div
      onClick={onTogglePin}
      className={cn(
        "group/tile relative flex items-center justify-center overflow-hidden rounded-(--radius-lg) bg-gradient-to-b from-slate-700 to-slate-900",
        onTogglePin && "cursor-pointer active:scale-[0.98] transition-transform",
        participant.isSpeaking && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-900",
        isCalling && "opacity-70",
        className
      )}
    >
      <Avatar name={user?.name ?? "Unknown"} size="lg" />

      {/* Calling overlay */}
      {isCalling && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 rounded-full bg-white/80 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
          <span className="text-[11px] font-medium text-white/90">Calling…</span>
        </div>
      )}

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

      {/* Pin indicator — always visible at 60% opacity, fully visible when pinned or on hover */}
      {onTogglePin && (
        <div
          className={cn(
            "absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-white transition-opacity",
            isPinned ? "opacity-100 ring-1 ring-primary" : "opacity-60 group-hover/tile:opacity-100"
          )}
          aria-hidden
        >
          {isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-2.5 pb-2 pt-5">
        <div className="flex items-center gap-1.5">
          {participant.isSpeaking ? (
            <SpeakingWaveform />
          ) : (
            participant.muted && <MicOff className="size-3 shrink-0 text-white/70" />
          )}
          <span className="truncate text-xs font-medium text-white drop-shadow-sm">{name}</span>
        </div>
      </div>
    </div>
  );
}
