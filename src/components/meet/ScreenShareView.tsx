import { ParticipantTile } from "@/components/calls/ParticipantTile";
import { ScreenShare } from "@/components/ui/icons";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import type { MeetSession } from "@/types";

interface ScreenShareViewProps {
  meet: MeetSession;
}

export function ScreenShareView({ meet }: ScreenShareViewProps) {
  const presenterId = meet.screenSharingUserId;
  const presenter = presenterId ? getUserById(presenterId) : undefined;
  const isSelf = presenterId === CURRENT_USER_ID;
  const presenterName = isSelf ? "You" : presenter?.name ?? "Someone";
  const others = meet.participants.filter((p) => p.userId !== presenterId);

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-6">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-(--radius-lg) border border-dashed border-white/15 bg-slate-800/50 text-slate-400">
        <ScreenShare className="size-10" />
        <p className="text-sm">
          {isSelf ? "You are sharing your screen" : `${presenterName} is sharing their screen`}
        </p>
      </div>
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
