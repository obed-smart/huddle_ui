import { create } from "zustand";
import type { Attachment, CallEvent, Conversation, GroupMemberRole, MeetEvent, Message, MessageReplyRef } from "@/types";
import {
  CURRENT_USER_ID,
  seedConversations,
  seedMessages,
} from "@/lib/seed-data";

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>;
  replyingTo: { conversationId: string; message: Message } | null;
  editingMessage: { conversationId: string; message: Message } | null;
  setActiveConversation: (id: string | null) => void;
  setReplyingTo: (info: { conversationId: string; message: Message } | null) => void;
  setEditingMessage: (info: { conversationId: string; message: Message } | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  confirmMessage: (conversationId: string, tempId: string, serverMessage: Message) => void;
  editMessage: (conversationId: string, messageId: string, text: string) => void;
  sendAttachment: (conversationId: string, file: File) => void;
  togglePin: (conversationId: string) => void;
  markRead: (conversationId: string) => void;
  getLastMessage: (conversationId: string) => Message | undefined;
  getUnreadCount: (conversationId: string) => number;
  addConversation: (conversation: Conversation) => void;
  addCallMessage: (conversationId: string, call: CallEvent) => void;
  addMeetMessage: (conversationId: string, meet: MeetEvent) => void;
  markMeetEnded: (conversationId: string, meetId: string, durationSeconds: number) => void;
  toggleReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void;
  sendVoiceMessage: (conversationId: string, durationSeconds: number) => void;
  addMemberToConversation: (conversationId: string, userId: string) => void;
  addSystemMessage: (conversationId: string, text: string) => void;
  getConversationByInviteCode: (code: string) => Conversation | undefined;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  updateGroupName: (conversationId: string, name: string) => void;
  updateGroupDescription: (conversationId: string, description: string) => void;
  toggleGroupPrivacy: (conversationId: string) => void;
  updateMemberRole: (conversationId: string, userId: string, role: GroupMemberRole) => void;
  removeMember: (conversationId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: seedConversations,
  messagesByConversation: seedMessages,
  activeConversationId: null,
  typingUsers: {
    "c-katie": [],
  },
  replyingTo: null,
  editingMessage: null,

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    if (id) get().markRead(id);
  },

  setReplyingTo: (info) => set({ replyingTo: info }),
  setEditingMessage: (info) => set({ editingMessage: info }),

  sendMessage: (conversationId, text) => {
    if (!text.trim()) return;
    const state = get();
    const replyRef = state.replyingTo?.conversationId === conversationId
      ? ({ messageId: state.replyingTo.message.id, senderId: state.replyingTo.message.senderId, text: state.replyingTo.message.text } satisfies MessageReplyRef)
      : undefined;

    // Client-generated temp ID — replaced by the real server ID once the socket ack arrives.
    // The "tmp_" prefix lets the socket handler identify which bubble to reconcile.
    const tempId = `tmp_${crypto.randomUUID()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: CURRENT_USER_ID,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: "sending", // clock icon until server confirms
      replyTo: replyRef,
    };

    set((state) => ({
      replyingTo: null,
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [
          ...(state.messagesByConversation[conversationId] ?? []),
          optimisticMessage,
        ],
      },
    }));

    // Simulates the server ack + real message row coming back over the socket.
    // When the real socket is wired up, delete this timeout and call
    // confirmMessage from the socket's message.ack / message.created handler instead:
    //   socket.emit("message:send", payload, (serverMessage) => {
    //     get().confirmMessage(conversationId, tempId, serverMessage);
    //   });
    setTimeout(() => {
      get().confirmMessage(conversationId, tempId, {
        ...optimisticMessage,
        id: `m-${Date.now()}`,   // real server ID would arrive here
        status: "delivered",
      });
    }, 900);
  },

  confirmMessage: (conversationId, tempId, serverMessage) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(
          (m) => (m.id === tempId ? serverMessage : m)
        ),
      },
    }));
  },

  sendAttachment: (conversationId, file) => {
    const attachment: Attachment = {
      id: `a-${Date.now()}`,
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      size: file.size,
    };
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      attachments: [attachment],
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [
          ...(state.messagesByConversation[conversationId] ?? []),
          message,
        ],
      },
    }));
  },

  togglePin: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, pinned: !c.pinned } : c
      ),
    }));
  },

  markRead: (conversationId) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (
          state.messagesByConversation[conversationId] ?? []
        ).map((m) =>
          m.senderId !== CURRENT_USER_ID ? { ...m, status: "read" } : m
        ),
      },
    }));
  },

  getLastMessage: (conversationId) => {
    const messages = get().messagesByConversation[conversationId] ?? [];
    return messages[messages.length - 1];
  },

  getUnreadCount: (conversationId) => {
    const messages = get().messagesByConversation[conversationId] ?? [];
    return messages.filter(
      (m) => m.senderId !== CURRENT_USER_ID && m.status !== "read"
    ).length;
  },

  addConversation: (conversation) => {
    set((state) => ({ conversations: [conversation, ...state.conversations] }));
  },

  addCallMessage: (conversationId, call) => {
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      call,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
    }));
  },

  addMeetMessage: (conversationId, meet) => {
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      meet,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
    }));
  },

  markMeetEnded: (conversationId, meetId, durationSeconds) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((m) =>
          m.meet?.meetId === meetId
            ? { ...m, meet: { ...m.meet, endedAt: new Date().toISOString(), durationSeconds } }
            : m
        ),
      },
    }));
  },

  toggleReaction: (conversationId, messageId, emoji, userId) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions ?? {}) };
          const reactors = reactions[emoji] ?? [];
          reactions[emoji] = reactors.includes(userId)
            ? reactors.filter((id) => id !== userId)
            : [...reactors, userId];
          if (reactions[emoji].length === 0) delete reactions[emoji];
          return { ...m, reactions };
        }),
      },
    }));
  },

  sendVoiceMessage: (conversationId, durationSeconds) => {
    const attachment: Attachment = {
      id: `a-${Date.now()}`,
      type: "voice",
      name: `voice-${Date.now()}.webm`,
      durationSeconds,
    };
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      attachments: [attachment],
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
    }));
  },

  addMemberToConversation: (conversationId, userId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId && !c.participantIds.includes(userId)
          ? { ...c, participantIds: [...c.participantIds, userId] }
          : c
      ),
    }));
  },

  addSystemMessage: (conversationId, text) => {
    const message: Message = {
      id: `m-sys-${Date.now()}`,
      conversationId,
      senderId: "system",
      text,
      isSystem: true,
      createdAt: new Date().toISOString(),
      status: "read",
    };
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
    }));
  },

  getConversationByInviteCode: (code) => {
    return get().conversations.find(
      (c) => c.inviteCode?.toLowerCase() === code.toLowerCase()
    );
  },

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping
          ? [...(state.typingUsers[conversationId] ?? []).filter((id) => id !== userId), userId]
          : (state.typingUsers[conversationId] ?? []).filter((id) => id !== userId),
      },
    })),

  updateGroupName: (conversationId, name) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, name } : c
      ),
    })),

  updateGroupDescription: (conversationId, description) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, description } : c
      ),
    })),

  toggleGroupPrivacy: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, isPrivate: !c.isPrivate } : c
      ),
    })),

  updateMemberRole: (conversationId, userId, role) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, memberRoles: { ...(c.memberRoles ?? {}), [userId]: role } }
          : c
      ),
    })),

  removeMember: (conversationId, userId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              participantIds: c.participantIds.filter((id) => id !== userId),
              memberRoles: Object.fromEntries(
                Object.entries(c.memberRoles ?? {}).filter(([id]) => id !== userId)
              ),
            }
          : c
      ),
    })),

  editMessage: (conversationId, messageId, text) => {
    if (!text.trim()) return;
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((m) =>
          m.id === messageId ? { ...m, text: text.trim(), edited: true } : m
        ),
      },
    }));
  },
}));
