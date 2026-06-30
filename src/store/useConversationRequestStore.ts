import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Conversation, Ping } from "@/types";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";

export type SendPingResult =
  | { status: "existing"; conversationId: string }
  | { status: "pending" }
  | { status: "sent" };

interface PingState {
  pings: Ping[];
  sendPing: (userId: string) => SendPingResult;
  resolveOutgoingPing: (pingId: string) => void;
  acceptPing: (pingId: string) => string | undefined;
  declinePing: (pingId: string) => void;
  simulateIncomingPing: (fromUserId: string) => void;
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
    });
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
