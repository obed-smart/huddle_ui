"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "@/components/ui/icons";
import { useCallStore } from "@/store/useCallStore";

interface CallControlsProps {
  conversationId: string;
}

export function CallControls({ conversationId }: CallControlsProps) {
  const router = useRouter();
  const isMuted = useCallStore((s) => s.isMuted);
  const isCameraOff = useCallStore((s) => s.isCameraOff);
  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleCamera = useCallStore((s) => s.toggleCamera);
  const endCall = useCallStore((s) => s.endCall);

  function handleEnd() {
    endCall();
    router.push(`/chat/${conversationId}`);
  }

  return (
    <div className="flex shrink-0 items-center justify-center gap-3 py-6">
      <IconButton label={isMuted ? "Unmute" : "Mute"} variant="ghostOnDark" size="lg" onClick={toggleMute}>
        {isMuted ? <MicOff /> : <Mic />}
      </IconButton>
      <IconButton
        label={isCameraOff ? "Turn camera on" : "Turn camera off"}
        variant="ghostOnDark"
        size="lg"
        onClick={toggleCamera}
      >
        {isCameraOff ? <VideoOff /> : <Video />}
      </IconButton>
      <IconButton label="End call" variant="destructive" size="lg" onClick={handleEnd}>
        <PhoneOff />
      </IconButton>
    </div>
  );
}
