import { EmptyState } from "@/components/ui/empty-state";
import { MessagesSquare } from "@/components/ui/icons";

export default function ChatIndexPage() {
  return (
    <EmptyState
      icon={<MessagesSquare />}
      title="Select a conversation"
      description="Choose a conversation from the list to start chatting."
    />
  );
}
