"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlus } from "@/components/ui/icons";
import { RequestCard } from "./RequestCard";
import { GroupInviteCard } from "./GroupInviteCard";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";
import { useUIStore } from "@/store/useUIStore";
import { useChatStore } from "@/store/useChatStore";
import {
  useConversationRequestStore,
  usePendingGroupInvites,
  usePendingIncomingRequests,
} from "@/store/useConversationRequestStore";

const DEMO_PING_DELAY_MS = 15_000;
const DEMO_GROUP_INVITE_DELAY_MS = 25_000;
const DEMO_PING_SESSION_KEY = "huddle:demo-incoming-ping-shown";
const DEMO_GROUP_INVITE_SESSION_KEY = "huddle:demo-group-invite-shown";

export function ConversationRequestsModal() {
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const open = activeModal === "pings";

  const incoming = usePendingIncomingRequests();
  const pendingGroupInvites = usePendingGroupInvites();
  const acceptPing = useConversationRequestStore((s) => s.acceptPing);
  const declinePing = useConversationRequestStore((s) => s.declinePing);
  const simulateIncomingPing = useConversationRequestStore((s) => s.simulateIncomingPing);
  const simulateGroupInvite = useConversationRequestStore((s) => s.simulateGroupInvite);
  const acceptGroupInvite = useConversationRequestStore((s) => s.acceptGroupInvite);
  const declineGroupInvite = useConversationRequestStore((s) => s.declineGroupInvite);

  // Simulate incoming DM ping after 15s
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

  // Simulate incoming group invite after 25s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(DEMO_GROUP_INVITE_SESSION_KEY)) return;
      sessionStorage.setItem(DEMO_GROUP_INVITE_SESSION_KEY, "1");
      simulateGroupInvite();
    }, DEMO_GROUP_INVITE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [simulateGroupInvite]);

  function handleAcceptPing(pingId: string) {
    const conversationId = acceptPing(pingId);
    if (conversationId) {
      closeModal();
      router.push(`/chat/${conversationId}`);
    }
  }

  function handleAcceptGroupInvite(inviteId: string) {
    const conversationId = acceptGroupInvite(inviteId);
    if (conversationId) {
      closeModal();
      router.push(`/chat/${conversationId}`);
    }
  }

  const isEmpty = incoming.length === 0 && pendingGroupInvites.length === 0;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && closeModal()}
      title="Requests"
      description="Accept a Ping to start chatting, or join a group you've been invited to."
    >
      {isEmpty ? (
        <EmptyState
          icon={<UserPlus />}
          title="No pending requests"
          description="You're all caught up."
          className="p-6"
        />
      ) : (
        <div className="scrollbar-thin max-h-80 space-y-0.5 overflow-y-auto">
          {pendingGroupInvites.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Group invites
              </p>
              {pendingGroupInvites.map((invite) => (
                <GroupInviteCard
                  key={invite.id}
                  invite={invite}
                  onAccept={() => handleAcceptGroupInvite(invite.id)}
                  onDecline={() => declineGroupInvite(invite.id)}
                />
              ))}
            </>
          )}
          {incoming.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pings
              </p>
              {incoming.map((ping) => (
                <RequestCard
                  key={ping.id}
                  request={ping}
                  onAccept={() => handleAcceptPing(ping.id)}
                  onDecline={() => declinePing(ping.id)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
