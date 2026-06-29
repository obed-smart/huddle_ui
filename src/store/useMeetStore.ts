import { create } from "zustand";
import type { MeetParticipant, MeetSession } from "@/types";
import { CURRENT_USER_ID } from "@/lib/seed-data";

interface MeetState {
  activeMeet: MeetSession | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isRightPanelOpen: boolean;
  rightPanelTab: "participants" | "chat" | "files";
  startMeet: (title: string, participants: MeetParticipant[]) => void;
  endMeet: () => void;
  toggleScreenShare: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleParticipantMute: (userId: string) => void;
  toggleHandRaised: () => void;
  pinParticipant: (userId?: string) => void;
  openRightPanel: (tab: "participants" | "chat" | "files") => void;
  closeRightPanel: () => void;
}

export const useMeetStore = create<MeetState>()((set) => ({
  activeMeet: null,
  isMuted: false,
  isCameraOff: false,
  isRightPanelOpen: true,
  rightPanelTab: "participants",

  startMeet: (title, participants) =>
    set({
      activeMeet: {
        id: `meet-${Date.now()}`,
        title,
        startedAt: new Date().toISOString(),
        participants,
        isScreenSharing: false,
      },
    }),

  endMeet: () => set({ activeMeet: null }),

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
}));
