import { cn } from "@/lib/utils";
import { AttachmentCard } from "./AttachmentCard";
import { ReadReceipt } from "./ReadReceipt";
import { ReplyQuote } from "./ReplyQuote";
import type { Message } from "@/types";

interface BubbleContentProps {
  message: Message;
  isOwn: boolean;
  senderName?: string; // group chats only — colored name at top of bubble
  timestamp: string;   // always — shown bottom-right inline (Telegram style)
}

export function BubbleContent({ message, isOwn, senderName, timestamp }: BubbleContentProps) {
  const hasText = !!message.text;
  const hasAttachments = (message.attachments?.length ?? 0) > 0;

  // Shared time + receipt node rendered at bottom-right of every bubble
  const timeRow = (
    <span
      className={cn(
        "flex shrink-0 items-center gap-0.5 text-[10px] leading-none",
        isOwn ? "text-bubble-sent-foreground/55" : "text-bubble-received-foreground/55"
      )}
    >
      {message.edited && <span className="mr-0.5">edited</span>}
      <span>{timestamp}</span>
      {isOwn && <ReadReceipt status={message.status} className="size-3 opacity-80" />}
    </span>
  );

  // Invisible spacer — same content as timeRow so it reserves identical inline width
  const spacerText = `${message.edited ? "edited " : ""}${timestamp}${isOwn ? " ✓" : ""}`;

  return (
    <>
      {/* Sender name — group received messages only, primary-colored */}
      {senderName && (
        <p className="mb-0.5 text-[11px] font-semibold leading-none text-primary">{senderName}</p>
      )}

      {message.replyTo && <ReplyQuote replyTo={message.replyTo} isOwn={isOwn} />}

      {message.attachments?.map((attachment) => (
        <AttachmentCard key={attachment.id} attachment={attachment} isOwn={isOwn} />
      ))}

      {hasText ? (
        // Text (with or without attachment): time floats inline at bottom-right
        <div className="relative">
          <p className="whitespace-pre-wrap break-words text-sm leading-snug">
            {message.text}
            {/*
              Invisible duplicate of the time label — keeps the last text line
              from overlapping the absolutely-positioned visible timestamp.
            */}
            <span aria-hidden className="invisible ml-1 inline-block select-none text-[10px] leading-none">
              {spacerText}
            </span>
          </p>
          <span className="pointer-events-none absolute bottom-0 right-0">{timeRow}</span>
        </div>
      ) : hasAttachments ? (
        // Attachment-only (image, voice, file): time below in a right-aligned row
        <div className="flex justify-end pt-0.5">{timeRow}</div>
      ) : null}
    </>
  );
}
