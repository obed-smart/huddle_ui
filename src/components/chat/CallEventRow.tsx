import { Phone, PhoneMissed, Video } from "@/components/ui/icons";
import { describeCallEvent } from "@/lib/call-events";
import { cn, formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

interface CallEventRowProps {
  message: Message;
}

export function CallEventRow({ message }: CallEventRowProps) {
  const event = message.call;
  if (!event) return null;

  const isMissed = event.outcome !== "completed";
  const Icon = isMissed ? PhoneMissed : event.type === "video" ? Video : Phone;

  return (
    <div className="flex justify-center py-1 px-4">
      <div className="flex w-full max-w-xs items-center gap-3 rounded-(--radius-lg) border border-border bg-surface px-4 py-3 shadow-(--shadow-sm)">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            isMissed ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className={cn("flex-1 text-sm font-medium", isMissed ? "text-destructive" : "text-foreground")}>
          {describeCallEvent(event)}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatTimestamp(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
