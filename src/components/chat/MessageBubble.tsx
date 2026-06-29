import { BubbleContent } from "./BubbleContent";
import { ReadReceipt } from "./ReadReceipt";
import { cn, formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const onlyAttachment =
    !message.text && message.attachments?.length === 1 ? message.attachments[0] : undefined;
  const bare = onlyAttachment?.type === "image";

  return (
    <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn(
          "flex flex-col gap-2",
          !bare && "rounded-(--radius-lg) px-3.5 py-2.5",
          !bare &&
            (isOwn
              ? "bg-bubble-sent text-bubble-sent-foreground"
              : "bg-bubble-received text-bubble-received-foreground")
        )}
      >
        <BubbleContent message={message} isOwn={isOwn} />
      </div>
      <div
        className={cn(
          "flex items-center gap-1 px-1 text-[11px] text-muted-foreground",
          isOwn && "flex-row-reverse"
        )}
      >
        <span>{formatTimestamp(message.createdAt)}</span>
        {isOwn && <ReadReceipt status={message.status} />}
      </div>
    </div>
  );
}
