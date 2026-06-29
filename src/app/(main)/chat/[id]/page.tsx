"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { EmptyState } from "@/components/ui/empty-state";
import { MessagesSquare } from "@/components/ui/icons";
import { useChatStore } from "@/store/useChatStore";

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>();
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === id));
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  useEffect(() => {
    setActiveConversation(id);
  }, [id, setActiveConversation]);

  if (!conversation) {
    return (
      <EmptyState
        icon={<MessagesSquare />}
        title="Conversation not found"
        description="This conversation may have been removed."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <ChatHeader conversation={conversation} />
      <MessageList conversation={conversation} />
      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
