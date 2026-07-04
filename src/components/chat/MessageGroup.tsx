import { Avatar } from "@/components/ui/avatar";
import { CallEventRow } from "./CallEventRow";
import { MeetEventRow } from "./MeetEventRow";
import { MessageBubble } from "./MessageBubble";
import { SystemEventRow } from "./SystemEventRow";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

interface MessageGroupProps {
  messages: Message[];
  conversation: Conversation;
}

export function MessageGroup({ messages, conversation }: MessageGroupProps) {
  const first = messages[0];
  if (messages.length === 1 && first.call) return <CallEventRow message={first} />;
  if (messages.length === 1 && first.meet) return <MeetEventRow message={first} />;
  if (messages.length === 1 && first.isSystem) return <SystemEventRow message={first} />;

  const isOwn = first.senderId === CURRENT_USER_ID;
  const sender = getUserById(first.senderId);
  const showSenderMeta = conversation.type === "group" && !isOwn;

  return (
    <div className={cn("flex items-end gap-2.5", isOwn && "flex-row-reverse")}>
      {showSenderMeta && <Avatar name={sender?.name ?? "Unknown"} size="sm" />}
      <div className={cn("flex min-w-0 flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            isLast={index === messages.length - 1}
            senderName={showSenderMeta && index === 0 ? (sender?.name ?? undefined) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
