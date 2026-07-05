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
    <div className={cn("flex items-center gap-3 rounded-(--radius-sm) px-3 py-2 transition-colors hover:bg-surface-hover", participant.role === "host" && "border-l-2 border-primary pl-2.5")}>
      <Avatar name={user?.name ?? "Unknown"} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {name}
          {isSelf && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">(You)</span>
          )}
        </span>
        {user?.username && (
          <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
        )}
      </span>
      {participant.handRaised && <Hand className="size-3.5 shrink-0 text-warning" />}
      {participant.role === "host" ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Crown className="size-2.5" />
          Host
        </span>
      ) : (
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Member</span>
      )}
      <button
        type="button"
        onClick={onToggleMute}
        disabled={!onToggleMute}
        aria-label={participant.muted ? `Unmute ${name}` : `Mute ${name}`}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          onToggleMute ? "cursor-pointer hover:bg-surface-hover" : "",
          participant.muted ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {participant.muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
      </button>
    </div>
  );
}
