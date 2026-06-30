import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Conversation, GroupJoinRequest } from "@/types";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { generateInviteCode } from "@/lib/group-utils";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";

export type JoinByCodeResult =
  | { status: "not-found" }
  | { status: "already-member"; conversationId: string }
  | { status: "joined"; conversationId: string }
  | { status: "pending" };

interface CreateGroupInput {
  name: string;
  memberIds: string[];
  isPrivate: boolean;
}

interface GroupState {
  joinRequests: GroupJoinRequest[];
  createGroup: (input: CreateGroupInput) => Conversation;
  joinByCode: (code: string) => JoinByCodeResult;
  resolveJoinRequest: (requestId: string) => void;
  cancelJoinRequest: (requestId: string) => void;
}

export const useGroupStore = create<GroupState>()((set, get) => ({
  joinRequests: [],

  createGroup: ({ name, memberIds, isPrivate }) => {
    const conversation: Conversation = {
      id: `c-${Date.now()}`,
      type: "group",
      name,
      participantIds: [CURRENT_USER_ID, ...memberIds],
      isPrivate,
      inviteCode: generateInviteCode(),
    };
    useChatStore.getState().addConversation(conversation);
    return conversation;
  },

  joinByCode: (code) => {
    const conversation = useChatStore.getState().getConversationByInviteCode(code.trim());
    if (!conversation) return { status: "not-found" };
    if (conversation.participantIds.includes(CURRENT_USER_ID)) {
      return { status: "already-member", conversationId: conversation.id };
    }

    if (!conversation.isPrivate) {
      useChatStore.getState().addMemberToConversation(conversation.id, CURRENT_USER_ID);
      return { status: "joined", conversationId: conversation.id };
    }

    const existing = get().joinRequests.find(
      (r) => r.status === "pending" && r.conversationId === conversation.id && r.fromUserId === CURRENT_USER_ID
    );
    if (existing) return { status: "pending" };

    const request: GroupJoinRequest = {
      id: `gjr-${Date.now()}`,
      conversationId: conversation.id,
      fromUserId: CURRENT_USER_ID,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ joinRequests: [request, ...state.joinRequests] }));
    setTimeout(() => get().resolveJoinRequest(request.id), 3000 + Math.random() * 3000);

    return { status: "pending" };
  },

  resolveJoinRequest: (requestId) => {
    const request = get().joinRequests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") return;

    const accepted = Math.random() < 0.85;
    set((state) => ({
      joinRequests: state.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: accepted ? "accepted" : "declined" } : r
      ),
    }));
    if (accepted) {
      useChatStore.getState().addMemberToConversation(request.conversationId, request.fromUserId);
    }

    const conversation = useChatStore
      .getState()
      .conversations.find((c) => c.id === request.conversationId);
    useNotificationsStore.getState().addNotification({
      type: "request",
      title: conversation?.name ?? "Group",
      body: accepted ? "Your request to join was accepted" : "Your request to join was declined",
    });
  },

  cancelJoinRequest: (requestId) => {
    set((state) => ({ joinRequests: state.joinRequests.filter((r) => r.id !== requestId) }));
  },
}));

export function usePendingJoinRequestFor(conversationId: string) {
  return useGroupStore(
    useShallow((s) =>
      s.joinRequests.find(
        (r) => r.status === "pending" && r.conversationId === conversationId && r.fromUserId === CURRENT_USER_ID
      )
    )
  );
}

export function getUserDisplayName(userId: string): string {
  return userId === CURRENT_USER_ID ? "You" : getUserById(userId)?.name ?? "Unknown";
}
