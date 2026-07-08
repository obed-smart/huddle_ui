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

// Pre-seed two pending requests so the admin sees requests immediately.
// c-team-meet is public so use c-design (private) for requests the current user will approve.
const SEED_REQUESTS: GroupJoinRequest[] = [
  {
    id: "gjr-seed-1",
    conversationId: "c-design",
    fromUserId: "u-marcus",
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(), // 12 min ago
  },
  {
    id: "gjr-seed-2",
    conversationId: "c-design",
    fromUserId: "u-priya",
    status: "pending",
    createdAt: new Date(Date.now() - 4 * 60_000).toISOString(), // 4 min ago
  },
];

interface GroupState {
  joinRequests: GroupJoinRequest[];
  createGroup: (input: CreateGroupInput) => Conversation;
  joinByCode: (code: string) => JoinByCodeResult;
  approveRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  cancelJoinRequest: (requestId: string) => void;
  simulateIncomingRequest: (conversationId: string) => void;
}

export const useGroupStore = create<GroupState>()((set, get) => ({
  joinRequests: SEED_REQUESTS,

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
      useChatStore.getState().addSystemMessage(conversation.id, "You joined the group");
      return { status: "joined", conversationId: conversation.id };
    }

    // Private group: check for existing pending request
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

    // Notify the group owner/admin (simulated: they accept after a delay)
    setTimeout(() => {
      const r = get().joinRequests.find((x) => x.id === request.id);
      if (!r || r.status !== "pending") return;
      get().approveRequest(request.id);
    }, 8000 + Math.random() * 4000);

    return { status: "pending" };
  },

  approveRequest: (requestId) => {
    const request = get().joinRequests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") return;

    set((state) => ({
      joinRequests: state.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: "accepted" } : r
      ),
    }));
    useChatStore.getState().addMemberToConversation(request.conversationId, request.fromUserId);

    const user = getUserById(request.fromUserId);
    const conversation = useChatStore
      .getState()
      .conversations.find((c) => c.id === request.conversationId);

    useChatStore.getState().addSystemMessage(
      request.conversationId,
      `${user?.name ?? "Someone"} joined the group`
    );

    // If the requester is the current user, notify them
    if (request.fromUserId === CURRENT_USER_ID) {
      useNotificationsStore.getState().addNotification({
        type: "join-request",
        title: conversation?.name ?? "Group",
        body: "Your request to join was approved",
        conversationId: request.conversationId,
      });
    }
  },

  declineRequest: (requestId) => {
    const request = get().joinRequests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") return;

    set((state) => ({
      joinRequests: state.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: "declined" } : r
      ),
    }));

    const conversation = useChatStore
      .getState()
      .conversations.find((c) => c.id === request.conversationId);

    if (request.fromUserId === CURRENT_USER_ID) {
      useNotificationsStore.getState().addNotification({
        type: "system",
        title: conversation?.name ?? "Group",
        body: "Your request to join was declined",
      });
    }
  },

  cancelJoinRequest: (requestId) => {
    set((state) => ({ joinRequests: state.joinRequests.filter((r) => r.id !== requestId) }));
  },

  simulateIncomingRequest: (conversationId) => {
    // Pick a user not already in the group and not already requesting
    const conversation = useChatStore
      .getState()
      .conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const candidates = ["u-katie", "u-sofia", "u-rafael", "u-jaydon"];
    const alreadyRequesting = new Set(
      get().joinRequests.filter((r) => r.conversationId === conversationId).map((r) => r.fromUserId)
    );
    const fromUserId = candidates.find(
      (id) => !conversation.participantIds.includes(id) && !alreadyRequesting.has(id)
    );
    if (!fromUserId) return;

    const request: GroupJoinRequest = {
      id: `gjr-sim-${Date.now()}`,
      conversationId,
      fromUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ joinRequests: [request, ...state.joinRequests] }));

    const user = getUserById(fromUserId);
    const groupName = conversation.name ?? "Group";
    useNotificationsStore.getState().addNotification({
      type: "join-request",
      title: groupName,
      body: `${user?.name ?? "Someone"} wants to join`,
      avatarUrl: user?.avatarUrl,
      userId: fromUserId,
      conversationId,
      actionId: request.id,
    });
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

export function useAdminPendingRequests(conversationId: string) {
  return useGroupStore(
    useShallow((s) =>
      s.joinRequests.filter(
        (r) => r.status === "pending" && r.conversationId === conversationId && r.fromUserId !== CURRENT_USER_ID
      )
    )
  );
}

export function getUserDisplayName(userId: string): string {
  return userId === CURRENT_USER_ID ? "You" : getUserById(userId)?.name ?? "Unknown";
}
