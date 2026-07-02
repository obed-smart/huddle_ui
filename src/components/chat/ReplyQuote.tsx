import { cn } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import type { MessageReplyRef } from "@/types";

interface ReplyQuoteProps {
  replyTo: MessageReplyRef;
  isOwn: boolean;
}

export function ReplyQuote({ replyTo, isOwn }: ReplyQuoteProps) {
  const sender = getUserById(replyTo.senderId);
  const name = replyTo.senderId === CURRENT_USER_ID ? "You" : (sender?.name ?? "Unknown");

  return (
    <div
      className={cn(
        "mb-1 rounded-(--radius-sm) border-l-2 px-2 py-1 text-xs",
        isOwn
          ? "border-bubble-sent-foreground/40 bg-bubble-sent-foreground/10"
          : "border-primary/50 bg-black/5"
      )}
    >
      <p className={cn("font-semibold", isOwn ? "text-bubble-sent-foreground/80" : "text-primary")}>
        {name}
      </p>
      <p className={cn("truncate", isOwn ? "text-bubble-sent-foreground/70" : "text-muted-foreground")}>
        {replyTo.text ?? "Attachment"}
      </p>
    </div>
  );
}
