import { create } from "zustand";
import { logCallEvent } from "@/lib/call-events";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import type { CallSession, CallStatus, CallType } from "@/types";

const INCOMING_CALL_TIMEOUT_MS = 20_000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CallState {
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isVideoPending: boolean;
  startCall: (conversationId: string, participantIds: string[], type: CallType) => void;
  simulateIncomingCall: (conversationId: string, participantIds: string[], type: CallType) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  devAddParticipant: () => void;
}

export const useCallStore = create<CallState>()((set, get) => {
  const isCallCurrent = (callId: string) => get().activeCall?.id === callId;

  function setCallStatus(callId: string, status: CallStatus) {
    set((state) => (state.activeCall?.id === callId ? { activeCall: { ...state.activeCall, status } } : {}));
  }

  async function runOutgoingCall(callId: string) {
    await wait(900);
    if (!isCallCurrent(callId)) return;
    setCallStatus(callId, "connecting");

    await wait(900);
    if (!isCallCurrent(callId)) return;
    setCallStatus(callId, "ringing");

    await wait(1800 + Math.random() * 1500);
    if (!isCallCurrent(callId)) return;

    if (Math.random() < 0.85) {
      set((state) =>
        state.activeCall?.id === callId
          ? { activeCall: { ...state.activeCall, status: "active", startedAt: new Date().toISOString() } }
          : {}
      );
      return;
    }

    setCallStatus(callId, "declined");
    await wait(1400);
    if (isCallCurrent(callId)) get().endCall();
  }

  return {
    activeCall: null,
    incomingCall: null,
    isMuted: false,
    isCameraOff: false,
    isVideoPending: false,

    startCall: (conversationId, participantIds, type) => {
      const callId = `call-${Date.now()}`;
      set({
        activeCall: {
          id: callId,
          conversationId,
          type,
          status: "calling",
          direction: "outgoing",
          participants: participantIds.map((userId) => ({
            userId,
            muted: false,
            cameraOff: type === "audio",
          })),
        },
        isMuted: false,
        isCameraOff: type === "audio",
      });
      runOutgoingCall(callId);
    },

    simulateIncomingCall: (conversationId, participantIds, type) => {
      const callId = `call-${Date.now()}`;
      set({
        incomingCall: {
          id: callId,
          conversationId,
          type,
          status: "ringing",
          direction: "incoming",
          participants: participantIds.map((userId) => ({ userId, muted: false, cameraOff: false })),
        },
      });

      setTimeout(() => {
        const incoming = get().incomingCall;
        if (!incoming || incoming.id !== callId) return;
        set({ incomingCall: null });
        logCallEvent(incoming, "missed");
      }, INCOMING_CALL_TIMEOUT_MS);
    },

    acceptCall: () => {
      const incoming = get().incomingCall;
      if (!incoming) return;
      set({
        activeCall: { ...incoming, status: "active", startedAt: new Date().toISOString() },
        incomingCall: null,
      });
    },

    declineCall: () => {
      const incoming = get().incomingCall;
      if (!incoming) return;
      set({ incomingCall: null });
      logCallEvent(incoming, "declined");
    },

    endCall: () => {
      const call = get().activeCall;
      if (call) {
        const outcome = call.status === "active" ? "completed" : call.status === "declined" ? "declined" : "missed";
        logCallEvent(call, outcome);
      }
      set({ activeCall: null, isMuted: false, isCameraOff: false });
    },

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

    toggleCamera: () => {
      const state = get();
      // Turning camera ON from OFF gets a 2s pending state to simulate negotiation
      if (state.isCameraOff) {
        set({ isVideoPending: true });
        setTimeout(() => {
          set((s) => ({
            isVideoPending: false,
            isCameraOff: false,
            activeCall: s.activeCall
              ? {
                  ...s.activeCall,
                  participants: s.activeCall.participants.map((p) =>
                    p.userId === CURRENT_USER_ID ? { ...p, cameraOff: false } : p
                  ),
                }
              : s.activeCall,
          }));
        }, 2000);
      } else {
        set((s) => ({
          isCameraOff: true,
          activeCall: s.activeCall
            ? {
                ...s.activeCall,
                participants: s.activeCall.participants.map((p) =>
                  p.userId === CURRENT_USER_ID ? { ...p, cameraOff: true } : p
                ),
              }
            : s.activeCall,
        }));
      }
    },

    devAddParticipant: () => {
      const DEV_USERS = ["u-jakob", "u-gustavo", "u-jaydon", "u-hanna", "u-skylar"];
      set((state) => {
        if (!state.activeCall) return state;
        const existing = new Set(state.activeCall.participants.map((p) => p.userId));
        const next = DEV_USERS.find((id) => !existing.has(id));
        if (!next) return state;
        return {
          activeCall: {
            ...state.activeCall,
            participants: [
              ...state.activeCall.participants,
              { userId: next, muted: false, cameraOff: false },
            ],
          },
        };
      });
    },
  };
});
