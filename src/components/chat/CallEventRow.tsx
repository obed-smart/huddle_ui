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
    <div className="flex items-center justify-center py-1">
      <span
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium",
          isMissed ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <Icon className="size-3.5" />
        {describeCallEvent(event)}
        <span className="text-muted-foreground/70">· {formatTimestamp(message.createdAt)}</span>
      </span>
    </div>
  );
}
