import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Conversation, ConversationRequest } from "@/types";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";

export type SendRequestResult =
  | { status: "existing"; conversationId: string }
  | { status: "pending" }
  | { status: "sent" };

interface ConversationRequestState {
  requests: ConversationRequest[];
  sendConversationRequest: (userId: string) => SendRequestResult;
  resolveOutgoingRequest: (requestId: string) => void;
  acceptConversationRequest: (requestId: string) => string | undefined;
  declineConversationRequest: (requestId: string) => void;
  simulateIncomingRequest: (fromUserId: string) => void;
}

function buildDmConversation(userId: string): Conversation {
  return { id: `c-${userId}`, type: "dm", participantIds: [CURRENT_USER_ID, userId] };
}

function findPendingBetween(requests: ConversationRequest[], userId: string) {
  return requests.find(
    (r) =>
      r.status === "pending" &&
      ((r.fromUserId === CURRENT_USER_ID && r.toUserId === userId) ||
        (r.fromUserId === userId && r.toUserId === CURRENT_USER_ID))
  );
}

export const useConversationRequestStore = create<ConversationRequestState>()((set, get) => ({
  requests: [],

  sendConversationRequest: (userId) => {
    const existing = useChatStore
      .getState()
      .conversations.find((c) => c.type === "dm" && c.participantIds.includes(userId));
    if (existing) return { status: "existing", conversationId: existing.id };

    if (findPendingBetween(get().requests, userId)) return { status: "pending" };

    const request: ConversationRequest = {
      id: `req-${Date.now()}`,
      fromUserId: CURRENT_USER_ID,
      toUserId: userId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ requests: [request, ...state.requests] }));
    setTimeout(() => get().resolveOutgoingRequest(request.id), 3000 + Math.random() * 3000);

    return { status: "sent" };
  },

  resolveOutgoingRequest: (requestId) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") return;

    const accepted = Math.random() < 0.85;
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: accepted ? "accepted" : "declined" } : r
      ),
    }));
    if (accepted) useChatStore.getState().addConversation(buildDmConversation(request.toUserId));

    const otherUser = getUserById(request.toUserId);
    useNotificationsStore.getState().addNotification({
      type: "request",
      title: otherUser?.name ?? "Someone",
      body: accepted ? "Accepted your conversation request" : "Declined your conversation request",
    });
  },

  acceptConversationRequest: (requestId) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") return undefined;

    set((state) => ({
      requests: state.requests.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r)),
    }));
    const conversation = buildDmConversation(request.fromUserId);
    useChatStore.getState().addConversation(conversation);
    return conversation.id;
  },

  declineConversationRequest: (requestId) => {
    set((state) => ({
      requests: state.requests.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r)),
    }));
  },

  simulateIncomingRequest: (fromUserId) => {
    const hasConvo = useChatStore
      .getState()
      .conversations.some((c) => c.type === "dm" && c.participantIds.includes(fromUserId));
    if (hasConvo || findPendingBetween(get().requests, fromUserId)) return;

    const request: ConversationRequest = {
      id: `req-${Date.now()}`,
      fromUserId,
      toUserId: CURRENT_USER_ID,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ requests: [request, ...state.requests] }));

    const fromUser = getUserById(fromUserId);
    useNotificationsStore.getState().addNotification({
      type: "request",
      title: fromUser?.name ?? "Someone",
      body: "Wants to start a conversation with you",
    });
  },
}));

export function useRelation(userId: string): "existing" | "pending" | "none" {
  const hasConvo = useChatStore((s) =>
    s.conversations.some((c) => c.type === "dm" && c.participantIds.includes(userId))
  );
  const requests = useConversationRequestStore((s) => s.requests);
  if (hasConvo) return "existing";
  return findPendingBetween(requests, userId) ? "pending" : "none";
}

export function usePendingIncomingRequests() {
  return useConversationRequestStore(
    useShallow((s) => s.requests.filter((r) => r.status === "pending" && r.toUserId === CURRENT_USER_ID))
  );
}
