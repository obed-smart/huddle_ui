import { CallTimer } from "@/components/shared/CallTimer";
import { IconButton } from "@/components/ui/icon-button";
import { MoreHorizontal, Share2, Users } from "@/components/ui/icons";
import type { MeetSession } from "@/types";

interface MeetHeaderProps {
  meet: MeetSession;
}

export function MeetHeader({ meet }: MeetHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{meet.title}</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            <CallTimer startedAt={meet.startedAt} />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          <Users className="size-3" />
          {meet.participants.length}
        </span>
        <IconButton label="Share meeting">
          <Share2 />
        </IconButton>
        <IconButton label="More options">
          <MoreHorizontal />
        </IconButton>
      </div>
    </header>
  );
}
