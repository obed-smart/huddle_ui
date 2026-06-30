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

const DEMO_PING_DELAY_MS = 15_000;
const DEMO_PING_SESSION_KEY = "huddle:demo-incoming-ping-shown";

export function ConversationRequestsModal() {
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const open = activeModal === "pings";

  const incoming = usePendingIncomingRequests();
  const acceptPing = useConversationRequestStore((s) => s.acceptPing);
  const declinePing = useConversationRequestStore((s) => s.declinePing);
  const simulateIncomingPing = useConversationRequestStore((s) => s.simulateIncomingPing);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(DEMO_PING_SESSION_KEY)) return;
      sessionStorage.setItem(DEMO_PING_SESSION_KEY, "1");

      const conversations = useChatStore.getState().conversations;
      const candidates = seedUsers.filter(
        (u) =>
          u.id !== CURRENT_USER_ID &&
          !conversations.some((c) => c.type === "dm" && c.participantIds.includes(u.id))
      );
      if (candidates.length === 0) return;
      const sender = candidates[Math.floor(Math.random() * candidates.length)];
      simulateIncomingPing(sender.id);
    }, DEMO_PING_DELAY_MS);

    return () => clearTimeout(timer);
  }, [simulateIncomingPing]);

  function handleAccept(pingId: string) {
    const conversationId = acceptPing(pingId);
    if (conversationId) {
      closeModal();
      router.push(`/chat/${conversationId}`);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && closeModal()}
      title="Pings"
      description="Accept a Ping to start chatting, or decline to dismiss it."
    >
      {incoming.length === 0 ? (
        <EmptyState
          icon={<UserPlus />}
          title="No pending Pings"
          description="You're all caught up."
          className="p-6"
        />
      ) : (
        <div className="scrollbar-thin max-h-80 space-y-0.5 overflow-y-auto">
          {incoming.map((ping) => (
            <RequestCard
              key={ping.id}
              request={ping}
              onAccept={() => handleAccept(ping.id)}
              onDecline={() => declinePing(ping.id)}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
