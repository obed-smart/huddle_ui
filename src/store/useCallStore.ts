import { create } from "zustand";
import type { CallSession, CallType } from "@/types";
import { CURRENT_USER_ID } from "@/lib/seed-data";

interface CallState {
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  isMuted: boolean;
  isCameraOff: boolean;
  startCall: (conversationId: string, participantIds: string[], type: CallType) => void;
  simulateIncomingCall: (conversationId: string, participantIds: string[], type: CallType) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

export const useCallStore = create<CallState>()((set, get) => ({
  activeCall: null,
  incomingCall: null,
  isMuted: false,
  isCameraOff: false,

  startCall: (conversationId, participantIds, type) => {
    set({
      activeCall: {
        id: `call-${Date.now()}`,
        conversationId,
        type,
        status: "active",
        startedAt: new Date().toISOString(),
        participants: participantIds.map((userId) => ({
          userId,
          muted: false,
          cameraOff: type === "audio",
        })),
      },
      isMuted: false,
      isCameraOff: type === "audio",
    });
  },

  simulateIncomingCall: (conversationId, participantIds, type) => {
    set({
      incomingCall: {
        id: `call-${Date.now()}`,
        conversationId,
        type,
        status: "ringing",
        participants: participantIds.map((userId) => ({
          userId,
          muted: false,
          cameraOff: false,
        })),
      },
    });
  },

  acceptCall: () => {
    const incoming = get().incomingCall;
    if (!incoming) return;
    set({
      activeCall: { ...incoming, status: "active", startedAt: new Date().toISOString() },
      incomingCall: null,
    });
  },

  declineCall: () => set({ incomingCall: null }),

  endCall: () => set({ activeCall: null, isMuted: false, isCameraOff: false }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
      activeCall: state.activeCall
        ? {
            ...state.activeCall,
            participants: state.activeCall.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, muted: !p.muted } : p
            ),
          }
        : state.activeCall,
    })),

  toggleCamera: () =>
    set((state) => ({
      isCameraOff: !state.isCameraOff,
      activeCall: state.activeCall
        ? {
            ...state.activeCall,
            participants: state.activeCall.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, cameraOff: !p.cameraOff } : p
            ),
          }
        : state.activeCall,
    })),
}));
