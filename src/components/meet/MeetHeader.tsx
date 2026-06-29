import { CallTimer } from "@/components/shared/CallTimer";
import { Users } from "@/components/ui/icons";
import type { MeetSession } from "@/types";

interface MeetHeaderProps {
  meet: MeetSession;
}

export function MeetHeader({ meet }: MeetHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{meet.title}</p>
        <CallTimer startedAt={meet.startedAt} className="text-xs text-slate-400" />
      </div>
      <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
        <Users className="size-3.5" />
        {meet.participants.length}
      </span>
    </header>
  );
}
