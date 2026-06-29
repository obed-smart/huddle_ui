"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import {
  Hand,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Users,
  Video,
  VideoOff,
} from "@/components/ui/icons";
import { useMeetStore } from "@/store/useMeetStore";

export function MeetControls() {
  const router = useRouter();
  const isMuted = useMeetStore((s) => s.isMuted);
  const isCameraOff = useMeetStore((s) => s.isCameraOff);
  const isSharing = useMeetStore((s) => s.activeMeet?.isScreenSharing ?? false);
  const isRightPanelOpen = useMeetStore((s) => s.isRightPanelOpen);
  const toggleMute = useMeetStore((s) => s.toggleMute);
  const toggleCamera = useMeetStore((s) => s.toggleCamera);
  const toggleScreenShare = useMeetStore((s) => s.toggleScreenShare);
  const toggleHandRaised = useMeetStore((s) => s.toggleHandRaised);
  const openRightPanel = useMeetStore((s) => s.openRightPanel);
  const closeRightPanel = useMeetStore((s) => s.closeRightPanel);
  const endMeet = useMeetStore((s) => s.endMeet);

  function handleLeave() {
    endMeet();
    router.push("/meet");
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-4 py-4 md:gap-3 md:py-6">
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
      <IconButton
        label={isSharing ? "Stop sharing" : "Share screen"}
        variant="ghostOnDark"
        size="lg"
        onClick={toggleScreenShare}
      >
        {isSharing ? <ScreenShareOff /> : <ScreenShare />}
      </IconButton>
      <IconButton label="Raise hand" variant="ghostOnDark" size="lg" onClick={toggleHandRaised}>
        <Hand />
      </IconButton>
      <IconButton
        label={isRightPanelOpen ? "Hide panel" : "Show participants"}
        variant="ghostOnDark"
        size="lg"
        onClick={() => (isRightPanelOpen ? closeRightPanel() : openRightPanel("participants"))}
      >
        <Users />
      </IconButton>
      <IconButton label="Leave meeting" variant="destructive" size="lg" onClick={handleLeave}>
        <PhoneOff />
      </IconButton>
    </div>
  );
}
