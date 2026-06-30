import { create } from "zustand";
import type { Attachment, CallEvent, Conversation, MeetEvent, Message } from "@/types";
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
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  sendAttachment: (conversationId: string, file: File) => void;
  togglePin: (conversationId: string) => void;
  markRead: (conversationId: string) => void;
  getLastMessage: (conversationId: string) => Message | undefined;
  getUnreadCount: (conversationId: string) => number;
  addConversation: (conversation: Conversation) => void;
  addCallMessage: (conversationId: string, call: CallEvent) => void;
  addMeetMessage: (conversationId: string, meet: MeetEvent) => void;
  toggleReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void;
  addMemberToConversation: (conversationId: string, userId: string) => void;
  getConversationByInviteCode: (code: string) => Conversation | undefined;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: seedConversations,
  messagesByConversation: seedMessages,
  activeConversationId: null,
  typingUsers: {
    "c-katie": [],
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    if (id) get().markRead(id);
  },

  sendMessage: (conversationId, text) => {
    if (!text.trim()) return;
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text: text.trim(),
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

    setTimeout(() => {
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (
            state.messagesByConversation[conversationId] ?? []
          ).map((m) => (m.id === message.id ? { ...m, status: "delivered" } : m)),
        },
      }));
    }, 900);
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

  addMemberToConversation: (conversationId, userId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId && !c.participantIds.includes(userId)
          ? { ...c, participantIds: [...c.participantIds, userId] }
          : c
      ),
    }));
  },

  getConversationByInviteCode: (code) => {
    return get().conversations.find(
      (c) => c.inviteCode?.toLowerCase() === code.toLowerCase()
    );
  },
}));
