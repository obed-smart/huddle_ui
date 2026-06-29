"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlus } from "@/components/ui/icons";
import { RequestCard } from "./RequestCard";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";
import { useUIStore } from "@/store/useUIStore";
import { useChatStore } from "@/store/useChatStore";
import {
  useConversationRequestStore,
  usePendingIncomingRequests,
} from "@/store/useConversationRequestStore";

const DEMO_REQUEST_DELAY_MS = 15_000;
const DEMO_REQUEST_SESSION_KEY = "huddle:demo-incoming-request-shown";

export function ConversationRequestsModal() {
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const open = activeModal === "conversation-requests";

  const incoming = usePendingIncomingRequests();
  const acceptConversationRequest = useConversationRequestStore((s) => s.acceptConversationRequest);
  const declineConversationRequest = useConversationRequestStore((s) => s.declineConversationRequest);
  const simulateIncomingRequest = useConversationRequestStore((s) => s.simulateIncomingRequest);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(DEMO_REQUEST_SESSION_KEY)) return;
      sessionStorage.setItem(DEMO_REQUEST_SESSION_KEY, "1");

      const conversations = useChatStore.getState().conversations;
      const candidates = seedUsers.filter(
        (u) =>
          u.id !== CURRENT_USER_ID &&
          !conversations.some((c) => c.type === "dm" && c.participantIds.includes(u.id))
      );
      if (candidates.length === 0) return;
      const sender = candidates[Math.floor(Math.random() * candidates.length)];
      simulateIncomingRequest(sender.id);
    }, DEMO_REQUEST_DELAY_MS);

    return () => clearTimeout(timer);
  }, [simulateIncomingRequest]);

  function handleAccept(requestId: string) {
    const conversationId = acceptConversationRequest(requestId);
    if (conversationId) {
      closeModal();
      router.push(`/chat/${conversationId}`);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && closeModal()}
      title="Conversation requests"
      description="Accept a request to start chatting, or decline to dismiss it."
    >
      {incoming.length === 0 ? (
        <EmptyState
          icon={<UserPlus />}
          title="No pending requests"
          description="You're all caught up."
          className="p-6"
        />
      ) : (
        <div className="scrollbar-thin max-h-80 space-y-0.5 overflow-y-auto">
          {incoming.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={() => handleAccept(request.id)}
              onDecline={() => declineConversationRequest(request.id)}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
