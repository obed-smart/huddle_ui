import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Conversation, GroupInvite, Ping } from "@/types";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";

const DEMO_GROUP_INVITES: Array<{ conversationId: string; groupName: string; fromUserId: string }> = [
  { conversationId: "c-sim-weekend", groupName: "Weekend Plans", fromUserId: "u-jakob" },
  { conversationId: "c-sim-reading", groupName: "Book Club 📚", fromUserId: "u-hanna" },
];

export type SendPingResult =
  | { status: "existing"; conversationId: string }
  | { status: "pending" }
  | { status: "sent" };

interface PingState {
  pings: Ping[];
  groupInvites: GroupInvite[];
  sendPing: (userId: string) => SendPingResult;
  resolveOutgoingPing: (pingId: string) => void;
  acceptPing: (pingId: string) => string | undefined;
  declinePing: (pingId: string) => void;
  simulateIncomingPing: (fromUserId: string) => void;
  simulateGroupInvite: () => void;
  acceptGroupInvite: (inviteId: string) => string | undefined;
  declineGroupInvite: (inviteId: string) => void;
}

function buildDmConversation(userId: string): Conversation {
  return { id: `c-${userId}`, type: "dm", participantIds: [CURRENT_USER_ID, userId] };
}

function findPendingBetween(pings: Ping[], userId: string) {
  return pings.find(
    (r) =>
      r.status === "pending" &&
      ((r.fromUserId === CURRENT_USER_ID && r.toUserId === userId) ||
        (r.fromUserId === userId && r.toUserId === CURRENT_USER_ID))
  );
}

export const useConversationRequestStore = create<PingState>()((set, get) => ({
  pings: [],
  groupInvites: [],

  sendPing: (userId) => {
    const existing = useChatStore
      .getState()
      .conversations.find((c) => c.type === "dm" && c.participantIds.includes(userId));
    if (existing) return { status: "existing", conversationId: existing.id };

    if (findPendingBetween(get().pings, userId)) return { status: "pending" };

    const ping: Ping = {
      id: `ping-${Date.now()}`,
      fromUserId: CURRENT_USER_ID,
      toUserId: userId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ pings: [ping, ...state.pings] }));
    setTimeout(() => get().resolveOutgoingPing(ping.id), 3000 + Math.random() * 3000);

    return { status: "sent" };
  },

  resolveOutgoingPing: (pingId) => {
    const ping = get().pings.find((r) => r.id === pingId);
    if (!ping || ping.status !== "pending") return;

    const accepted = Math.random() < 0.85;
    set((state) => ({
      pings: state.pings.map((r) =>
        r.id === pingId ? { ...r, status: accepted ? "accepted" : "declined" } : r
      ),
    }));
    if (accepted) useChatStore.getState().addConversation(buildDmConversation(ping.toUserId));

    const otherUser = getUserById(ping.toUserId);
    useNotificationsStore.getState().addNotification({
      type: "ping",
      title: otherUser?.name ?? "Someone",
      body: accepted ? "Accepted your Ping" : "Declined your Ping",
    });
  },

  acceptPing: (pingId) => {
    const ping = get().pings.find((r) => r.id === pingId);
    if (!ping || ping.status !== "pending") return undefined;

    set((state) => ({
      pings: state.pings.map((r) => (r.id === pingId ? { ...r, status: "accepted" } : r)),
    }));
    const conversation = buildDmConversation(ping.fromUserId);
    useChatStore.getState().addConversation(conversation);
    return conversation.id;
  },

  declinePing: (pingId) => {
    set((state) => ({
      pings: state.pings.map((r) => (r.id === pingId ? { ...r, status: "declined" } : r)),
    }));
  },

  simulateIncomingPing: (fromUserId) => {
    const hasConvo = useChatStore
      .getState()
      .conversations.some((c) => c.type === "dm" && c.participantIds.includes(fromUserId));
    if (hasConvo || findPendingBetween(get().pings, fromUserId)) return;

    const ping: Ping = {
      id: `ping-${Date.now()}`,
      fromUserId,
      toUserId: CURRENT_USER_ID,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ pings: [ping, ...state.pings] }));

    const fromUser = getUserById(fromUserId);
    useNotificationsStore.getState().addNotification({
      type: "ping",
      title: fromUser?.name ?? "Someone",
      body: `@${fromUser?.username ?? "someone"} pinged you`,
      actionId: ping.id,
    });
  },
  simulateGroupInvite: () => {
    const existing = get().groupInvites;
    const available = DEMO_GROUP_INVITES.filter(
      (d) =>
        !existing.some((gi) => gi.conversationId === d.conversationId) &&
        !useChatStore.getState().conversations.some((c) => c.id === d.conversationId)
    );
    if (available.length === 0) return;

    const demo = available[Math.floor(Math.random() * available.length)];
    const invite: GroupInvite = {
      id: `gi-${Date.now()}`,
      conversationId: demo.conversationId,
      groupName: demo.groupName,
      fromUserId: demo.fromUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ groupInvites: [invite, ...state.groupInvites] }));

    const fromUser = getUserById(demo.fromUserId);
    useNotificationsStore.getState().addNotification({
      type: "system",
      title: fromUser?.name ?? "Someone",
      body: `Invited you to join ${demo.groupName}`,
      actionId: invite.id,
    });
  },

  acceptGroupInvite: (inviteId) => {
    const invite = get().groupInvites.find((gi) => gi.id === inviteId);
    if (!invite || invite.status !== "pending") return undefined;

    set((state) => ({
      groupInvites: state.groupInvites.map((gi) =>
        gi.id === inviteId ? { ...gi, status: "accepted" } : gi
      ),
    }));

    const conversation: Conversation = {
      id: invite.conversationId,
      type: "group",
      name: invite.groupName,
      participantIds: [invite.fromUserId, CURRENT_USER_ID],
      memberRoles: { [invite.fromUserId]: "owner" },
    };
    useChatStore.getState().addConversation(conversation);
    const fromUser = getUserById(invite.fromUserId);
    useChatStore.getState().addSystemMessage(
      invite.conversationId,
      `@${getUserById(CURRENT_USER_ID)?.username ?? "you"} has just joined`
    );
    // Also post a welcome message from the inviter
    void fromUser;
    return invite.conversationId;
  },

  declineGroupInvite: (inviteId) => {
    set((state) => ({
      groupInvites: state.groupInvites.map((gi) =>
        gi.id === inviteId ? { ...gi, status: "declined" } : gi
      ),
    }));
  },
}));

// ── Backwards-compatible aliases (so callers don't all need renaming at once) ──
export function useRelation(userId: string): "existing" | "pending" | "none" {
  const hasConvo = useChatStore((s) =>
    s.conversations.some((c) => c.type === "dm" && c.participantIds.includes(userId))
  );
  const pings = useConversationRequestStore((s) => s.pings);
  if (hasConvo) return "existing";
  return findPendingBetween(pings, userId) ? "pending" : "none";
}

export function usePendingIncomingRequests() {
  return useConversationRequestStore(
    useShallow((s) => s.pings.filter((r) => r.status === "pending" && r.toUserId === CURRENT_USER_ID))
  );
}

export function usePendingGroupInvites() {
  return useConversationRequestStore(
    useShallow((s) => s.groupInvites.filter((gi) => gi.status === "pending"))
  );
}

export function useTotalPendingCount() {
  const pings = usePendingIncomingRequests();
  const invites = usePendingGroupInvites();
  return pings.length + invites.length;
}
