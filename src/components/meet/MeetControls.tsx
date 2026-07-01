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
import { useChatStore } from "@/store/useChatStore";
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
    const meet = useMeetStore.getState().activeMeet;
    const destination = meet && meet.conversationId !== "instant"
      ? `/chat/${meet.conversationId}`
      : "/chat";
    if (meet) {
      const durationSeconds = Math.floor((Date.now() - new Date(meet.startedAt).getTime()) / 1000);
      useChatStore.getState().markMeetEnded(meet.conversationId, meet.id, durationSeconds);
    }
    endMeet();
    router.push(destination);
  }

  return (
    <div className="flex shrink-0 justify-center px-4 pb-5 pt-3 md:pb-6">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm md:gap-3">
        <IconButton label={isMuted ? "Unmute" : "Mute"} variant="filled" size="lg" onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
        <IconButton
          label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          variant="filled"
          size="lg"
          onClick={toggleCamera}
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </IconButton>
        <IconButton
          label={isSharing ? "Stop sharing" : "Share screen"}
          variant={isSharing ? "primary" : "filled"}
          size="lg"
          onClick={toggleScreenShare}
        >
          {isSharing ? <ScreenShareOff /> : <ScreenShare />}
        </IconButton>
        <IconButton label="Raise hand" variant="filled" size="lg" onClick={toggleHandRaised}>
          <Hand />
        </IconButton>
        <IconButton
          label={isRightPanelOpen ? "Hide panel" : "Show participants"}
          variant={isRightPanelOpen ? "primary" : "filled"}
          size="lg"
          onClick={() => (isRightPanelOpen ? closeRightPanel() : openRightPanel("participants"))}
        >
          <Users />
        </IconButton>
        <IconButton label="Leave meeting" variant="destructive" size="lg" onClick={handleLeave}>
          <PhoneOff />
        </IconButton>
      </div>
    </div>
  );
}
