import { AttachmentCard } from "./AttachmentCard";
import type { Message } from "@/types";

interface BubbleContentProps {
  message: Message;
  isOwn: boolean;
}

export function BubbleContent({ message, isOwn }: BubbleContentProps) {
  return (
    <>
      {message.attachments?.map((attachment) => (
        <AttachmentCard key={attachment.id} attachment={attachment} isOwn={isOwn} />
      ))}
      {message.text && <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>}
    </>
  );
}
