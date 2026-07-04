"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import {
  Hand,
  LayoutGrid,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Users,
  Video,
  VideoOff,
} from "@/components/ui/icons";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useMeetStore } from "@/store/useMeetStore";

export function MeetControls() {
  const router = useRouter();
  const isMuted = useMeetStore((s) => s.isMuted);
  const isCameraOff = useMeetStore((s) => s.isCameraOff);
  const isSharing = useMeetStore((s) => s.activeMeet?.isScreenSharing ?? false);
  const isRightPanelOpen = useMeetStore((s) => s.isRightPanelOpen);
  const isHandRaised = useMeetStore(
    (s) => s.activeMeet?.participants.find((p) => p.userId === CURRENT_USER_ID)?.handRaised ?? false
  );
  const toggleMute = useMeetStore((s) => s.toggleMute);
  const toggleCamera = useMeetStore((s) => s.toggleCamera);
  const toggleScreenShare = useMeetStore((s) => s.toggleScreenShare);
  const toggleHandRaised = useMeetStore((s) => s.toggleHandRaised);
  const openRightPanel = useMeetStore((s) => s.openRightPanel);
  const closeRightPanel = useMeetStore((s) => s.closeRightPanel);
  const endMeet = useMeetStore((s) => s.endMeet);
  const layoutMode = useMeetStore((s) => s.layoutMode);
  const setLayoutMode = useMeetStore((s) => s.setLayoutMode);

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
        <IconButton label={isHandRaised ? "Lower hand" : "Raise hand"} variant={isHandRaised ? "primary" : "filled"} size="lg" onClick={toggleHandRaised}>
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
        <IconButton
          label={
            layoutMode === "grid"
              ? "Switch to speaker view"
              : layoutMode === "speaker"
              ? "Switch to fullscreen"
              : "Switch to grid"
          }
          variant={layoutMode !== "grid" ? "primary" : "filled"}
          size="lg"
          onClick={() =>
            setLayoutMode(layoutMode === "grid" ? "speaker" : layoutMode === "speaker" ? "fullscreen" : "grid")
          }
        >
          {layoutMode === "grid" ? (
            <LayoutGrid />
          ) : layoutMode === "speaker" ? (
            <Maximize2 />
          ) : (
            <Minimize2 />
          )}
        </IconButton>
        <div className="mx-1 h-8 w-px bg-border" />
        <IconButton label="Leave meeting" variant="destructive" size="lg" onClick={handleLeave}>
          <PhoneOff />
        </IconButton>
      </div>
    </div>
  );
}
