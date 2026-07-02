import { AttachmentCard } from "./AttachmentCard";
import { ReplyQuote } from "./ReplyQuote";
import type { Message } from "@/types";

interface BubbleContentProps {
  message: Message;
  isOwn: boolean;
}

export function BubbleContent({ message, isOwn }: BubbleContentProps) {
  return (
    <>
      {message.replyTo && <ReplyQuote replyTo={message.replyTo} isOwn={isOwn} />}
      {message.attachments?.map((attachment) => (
        <AttachmentCard key={attachment.id} attachment={attachment} isOwn={isOwn} />
      ))}
      {message.text && <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>}
      {message.edited && (
        <span className="mt-0.5 block text-[10px] opacity-50">edited</span>
      )}
    </>
  );
}
