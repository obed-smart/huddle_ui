"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
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
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
        <IconButton label={isMuted ? "Unmute" : "Mute"} variant="filled" size="lg" onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
        <IconButton
          label={isVideoPending ? "Connecting camera…" : isCameraOff ? "Turn camera on" : "Turn camera off"}
          variant="filled"
          size="lg"
          onClick={toggleCamera}
          disabled={isVideoPending}
        >
          {isVideoPending ? <Loader2 className="animate-spin" /> : isCameraOff ? <VideoOff /> : <Video />}
        </IconButton>
        <div className="mx-1 h-8 w-px bg-border" />
        <IconButton label="End call" variant="destructive" size="lg" onClick={handleEnd}>
          <PhoneOff />
        </IconButton>
      </div>
    </div>
  );
}
