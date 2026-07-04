"use client";

import { useRouter } from "next/navigation";
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from "@/components/ui/icons";
import { useCallStore } from "@/store/useCallStore";

interface CallControlsProps {
  conversationId: string;
}

export function CallControls({ conversationId }: CallControlsProps) {
  const router = useRouter();
  const isMuted = useCallStore((s) => s.isMuted);
  const isCameraOff = useCallStore((s) => s.isCameraOff);
  const isVideoPending = useCallStore((s) => s.isVideoPending);
  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleCamera = useCallStore((s) => s.toggleCamera);
  const endCall = useCallStore((s) => s.endCall);

  function handleEnd() {
    endCall();
    router.push(`/chat/${conversationId}`);
  }

  return (
    <div className="flex shrink-0 justify-center px-4 pb-6 pt-3">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 shadow-lg backdrop-blur-md">
        {/* Mute */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className={`flex size-12 items-center justify-center rounded-full transition-all active:scale-95 ${
            isMuted
              ? "bg-white/20 text-white ring-1 ring-white/30"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={toggleCamera}
          disabled={isVideoPending}
          aria-label={
            isVideoPending
              ? "Connecting camera…"
              : isCameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
          className={`flex size-12 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 ${
            isCameraOff
              ? "bg-white/20 text-white ring-1 ring-white/30"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isVideoPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isCameraOff ? (
            <VideoOff className="size-5" />
          ) : (
            <Video className="size-5" />
          )}
        </button>

        <div className="mx-1 h-8 w-px bg-white/15" />

        {/* End call */}
        <button
          type="button"
          onClick={handleEnd}
          aria-label="End call"
          className="flex size-12 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-all hover:bg-destructive-hover active:scale-95"
        >
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}
