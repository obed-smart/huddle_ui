import { create } from "zustand";
import type { MeetParticipant, MeetSession } from "@/types";
import { CURRENT_USER_ID } from "@/lib/seed-data";

export interface MeetReaction {
  id: string;
  emoji: string;
  userId: string;
  offset: number; // horizontal offset in px for stagger
  exiting: boolean;
}

interface MeetState {
  activeMeet: MeetSession | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isRightPanelOpen: boolean;
  rightPanelTab: "participants" | "chat" | "files";
  meetReactions: MeetReaction[];
  layoutMode: "grid" | "speaker" | "fullscreen";
  startMeet: (title: string, participants: MeetParticipant[], conversationId: string) => string;
  endMeet: () => void;
  setLayoutMode: (mode: "grid" | "speaker" | "fullscreen") => void;
  toggleScreenShare: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleParticipantMute: (userId: string) => void;
  toggleHandRaised: () => void;
  pinParticipant: (userId?: string) => void;
  openRightPanel: (tab: "participants" | "chat" | "files") => void;
  closeRightPanel: () => void;
  addMeetReaction: (emoji: string, userId: string) => void;
  devSimulateReaction: () => void;
}

export const useMeetStore = create<MeetState>()((set) => ({
  activeMeet: null,
  isMuted: false,
  isCameraOff: false,
  isRightPanelOpen: false,
  rightPanelTab: "participants",
  meetReactions: [],
  layoutMode: "grid",

  startMeet: (title, participants, conversationId) => {
    const id = `meet-${Date.now()}`;
    set({
      activeMeet: {
        id,
        conversationId,
        title,
        startedAt: new Date().toISOString(),
        participants,
        isScreenSharing: false,
      },
    });
    return id;
  },

  endMeet: () => set({ activeMeet: null, layoutMode: "grid" }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),

  toggleScreenShare: () =>
    set((state) => {
      if (!state.activeMeet) return state;
      const sharing = !state.activeMeet.isScreenSharing;
      return {
        activeMeet: {
          ...state.activeMeet,
          isScreenSharing: sharing,
          screenSharingUserId: sharing ? CURRENT_USER_ID : undefined,
        },
      };
    }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
      activeMeet: state.activeMeet
        ? {
            ...state.activeMeet,
            participants: state.activeMeet.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, muted: !p.muted } : p
            ),
          }
        : state.activeMeet,
    })),

  toggleCamera: () =>
    set((state) => ({
      isCameraOff: !state.isCameraOff,
      activeMeet: state.activeMeet
        ? {
            ...state.activeMeet,
            participants: state.activeMeet.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, cameraOff: !p.cameraOff } : p
            ),
          }
        : state.activeMeet,
    })),

  toggleParticipantMute: (userId) =>
    set((state) => ({
      activeMeet: state.activeMeet
        ? {
            ...state.activeMeet,
            participants: state.activeMeet.participants.map((p) =>
              p.userId === userId ? { ...p, muted: !p.muted } : p
            ),
          }
        : state.activeMeet,
    })),

  toggleHandRaised: () =>
    set((state) => ({
      activeMeet: state.activeMeet
        ? {
            ...state.activeMeet,
            participants: state.activeMeet.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, handRaised: !p.handRaised } : p
            ),
          }
        : state.activeMeet,
    })),

  pinParticipant: (userId) =>
    set((state) => ({
      activeMeet: state.activeMeet
        ? { ...state.activeMeet, pinnedUserId: userId }
        : state.activeMeet,
    })),

  openRightPanel: (tab) => set({ isRightPanelOpen: true, rightPanelTab: tab }),
  closeRightPanel: () => set({ isRightPanelOpen: false }),

  addMeetReaction: (emoji, userId) => {
    const id = `rxn-${Date.now()}-${Math.random()}`;
    const offset = Math.round((Math.random() - 0.5) * 120);
    set((state) => ({
      meetReactions: [...state.meetReactions, { id, emoji, userId, offset, exiting: false }],
    }));
    // Begin exit animation 2.5s after adding
    setTimeout(() => {
      set((state) => ({
        meetReactions: state.meetReactions.map((r) => (r.id === id ? { ...r, exiting: true } : r)),
      }));
    }, 2500);
    // Remove from state after exit animation (0.5s)
    setTimeout(() => {
      set((state) => ({ meetReactions: state.meetReactions.filter((r) => r.id !== id) }));
    }, 3000);
  },

  devSimulateReaction: () => {
    const DEV_EMOJIS = ["👍", "❤️", "🎉", "😂", "🔥", "👏"];
    const emoji = DEV_EMOJIS[Math.floor(Math.random() * DEV_EMOJIS.length)];
    const DEV_USER = "u-jakob";
    set((state) => {
      const id = `rxn-${Date.now()}-${Math.random()}`;
      const offset = Math.round((Math.random() - 0.5) * 120);
      setTimeout(() => {
        set((s) => ({
          meetReactions: s.meetReactions.map((r) => (r.id === id ? { ...r, exiting: true } : r)),
        }));
      }, 2500);
      setTimeout(() => {
        set((s) => ({ meetReactions: s.meetReactions.filter((r) => r.id !== id) }));
      }, 3000);
      return {
        meetReactions: [...state.meetReactions, { id, emoji, userId: DEV_USER, offset, exiting: false }],
      };
    });
  },
}));
