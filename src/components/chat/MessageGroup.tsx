import { Avatar } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

interface MessageGroupProps {
  messages: Message[];
  conversation: Conversation;
}

export function MessageGroup({ messages, conversation }: MessageGroupProps) {
  const first = messages[0];
  const isOwn = first.senderId === CURRENT_USER_ID;
  const sender = getUserById(first.senderId);
  const showSenderMeta = conversation.type === "group" && !isOwn;

  return (
    <div className={cn("flex items-end gap-2.5", isOwn && "flex-row-reverse")}>
      {showSenderMeta && <Avatar name={sender?.name ?? "Unknown"} size="sm" />}
      <div className={cn("flex max-w-[78%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {showSenderMeta && (
          <span className="px-1 text-xs font-medium text-muted-foreground">{sender?.name}</span>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={isOwn} />
        ))}
      </div>
    </div>
  );
}
