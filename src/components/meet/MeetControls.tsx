"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import {
  Expand,
  Hand,
  LayoutGrid,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Shrink,
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

  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  async function toggleBrowserFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser doesn't support fullscreen or it was denied
    }
  }

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
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-(--shadow-sm) md:gap-2.5">
        {/* Mic — red when muted */}
        <IconButton
          label={isMuted ? "Unmute" : "Mute"}
          size="lg"
          onClick={toggleMute}
          className={isMuted
            ? "bg-destructive/10 text-destructive ring-1 ring-destructive/25 hover:bg-destructive/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>

        {/* Camera — red when off */}
        <IconButton
          label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          size="lg"
          onClick={toggleCamera}
          className={isCameraOff
            ? "bg-destructive/10 text-destructive ring-1 ring-destructive/25 hover:bg-destructive/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </IconButton>

        {/* Screen share — emerald when active */}
        <IconButton
          label={isSharing ? "Stop sharing" : "Share screen"}
          size="lg"
          onClick={toggleScreenShare}
          className={isSharing
            ? "bg-success/10 text-success ring-1 ring-success/25 hover:bg-success/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          {isSharing ? <ScreenShareOff /> : <ScreenShare />}
        </IconButton>

        {/* Hand raise — amber when raised */}
        <IconButton
          label={isHandRaised ? "Lower hand" : "Raise hand"}
          size="lg"
          onClick={toggleHandRaised}
          className={isHandRaised
            ? "bg-warning/10 text-warning ring-1 ring-warning/25 hover:bg-warning/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          <Hand />
        </IconButton>

        {/* Participants panel — primary when open */}
        <IconButton
          label={isRightPanelOpen ? "Hide panel" : "Show participants"}
          size="lg"
          onClick={() => (isRightPanelOpen ? closeRightPanel() : openRightPanel("participants"))}
          className={isRightPanelOpen
            ? "bg-primary/10 text-primary ring-1 ring-primary/25 hover:bg-primary/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          <Users />
        </IconButton>

        {/* Layout mode cycle: grid → speaker → fullscreen */}
        <IconButton
          label={
            layoutMode === "grid" ? "Switch to speaker view"
            : layoutMode === "speaker" ? "Switch to fullscreen"
            : "Switch to grid"
          }
          size="lg"
          onClick={() =>
            setLayoutMode(layoutMode === "grid" ? "speaker" : layoutMode === "speaker" ? "fullscreen" : "grid")
          }
          className={layoutMode !== "grid"
            ? "bg-primary/10 text-primary ring-1 ring-primary/25 hover:bg-primary/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          {layoutMode === "grid" ? <LayoutGrid /> : layoutMode === "speaker" ? <Maximize2 /> : <Minimize2 />}
        </IconButton>

        {/* Browser fullscreen — hides browser chrome */}
        <IconButton
          label={isBrowserFullscreen ? "Exit browser fullscreen" : "Browser fullscreen"}
          size="lg"
          onClick={toggleBrowserFullscreen}
          className={isBrowserFullscreen
            ? "bg-primary/10 text-primary ring-1 ring-primary/25 hover:bg-primary/18"
            : "bg-muted text-foreground hover:bg-surface-hover"}
        >
          {isBrowserFullscreen ? <Shrink /> : <Expand />}
        </IconButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <IconButton label="Leave meeting" variant="destructive" size="lg" onClick={handleLeave}>
          <PhoneOff />
        </IconButton>
      </div>
    </div>
  );
}
