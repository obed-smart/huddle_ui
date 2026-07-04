"use client";

import { useEffect, useRef, useState } from "react";
import { FileSharePanel } from "./FileSharePanel";
import { MeetChat } from "./MeetChat";
import { MeetControls } from "./MeetControls";
import { MeetGrid } from "./MeetGrid";
import { MeetHeader } from "./MeetHeader";
import { MeetParticipantList } from "./MeetParticipantList";
import { ScreenShareView } from "./ScreenShareView";
import { IconButton } from "@/components/ui/icon-button";
import { Folder, MessageSquare, Users, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useMeetStore } from "@/store/useMeetStore";
import { getUserById, CURRENT_USER_ID } from "@/lib/seed-data";

const DEV_REACTION_EMOJIS = ["👍", "❤️", "🎉", "😂", "🔥", "👏"];
const UI_AUTO_HIDE_MS = 4000;
const TOAST_DURATION_MS = 4000;

const TABS = [
  { id: "participants", label: "Participants", icon: Users },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Folder },
] as const;

interface ChatToast {
  id: string;
  senderName: string;
  text: string;
}

function PanelContent({
  rightPanelTab,
  openRightPanel,
  closeRightPanel,
  participants,
}: {
  rightPanelTab: "participants" | "chat" | "files";
  openRightPanel: (tab: "participants" | "chat" | "files") => void;
  closeRightPanel: () => void;
  participants: import("@/types").MeetParticipant[];
}) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <p className="font-heading text-sm font-semibold text-foreground">
          {TABS.find((t) => t.id === rightPanelTab)?.label ?? "Panel"}
        </p>
        <div className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => openRightPanel(tab.id)}
              aria-label={tab.label}
              aria-current={rightPanelTab === tab.id}
              className={cn(
                "flex size-8 items-center justify-center rounded-(--radius-sm) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                rightPanelTab === tab.id
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <tab.icon className="size-4" />
            </button>
          ))}
          <IconButton label="Close panel" size="sm" onClick={closeRightPanel}>
            <X />
          </IconButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rightPanelTab === "participants" && <MeetParticipantList participants={participants} />}
        {rightPanelTab === "chat" && <MeetChat />}
        {rightPanelTab === "files" && <FileSharePanel />}
      </div>
    </>
  );
}

export function MeetOverlay() {
  const activeMeet = useMeetStore((s) => s.activeMeet);
  const isRightPanelOpen = useMeetStore((s) => s.isRightPanelOpen);
  const rightPanelTab = useMeetStore((s) => s.rightPanelTab);
  const openRightPanel = useMeetStore((s) => s.openRightPanel);
  const closeRightPanel = useMeetStore((s) => s.closeRightPanel);
  const meetReactions = useMeetStore((s) => s.meetReactions);
  const addMeetReaction = useMeetStore((s) => s.addMeetReaction);
  const devSimulateReaction = useMeetStore((s) => s.devSimulateReaction);
  const pinParticipant = useMeetStore((s) => s.pinParticipant);
  const layoutMode = useMeetStore((s) => s.layoutMode);
  const meetChatMessages = useMeetStore((s) => s.meetChatMessages);

  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [chatToasts, setChatToasts] = useState<ChatToast[]>([]);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgCountRef = useRef(0);

  const isFullscreen = layoutMode === "fullscreen";
  const shouldAutoHide = isFullscreen || isLandscape;

  // Landscape detection
  useEffect(() => {
    function check() {
      setIsLandscape(window.innerWidth > window.innerHeight);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-hide on fullscreen/landscape; reset to visible on portrait/grid/speaker
  function scheduleHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsUIVisible(false), UI_AUTO_HIDE_MS);
  }

  useEffect(() => {
    if (shouldAutoHide) {
      scheduleHide();
      return () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const reset = setTimeout(() => setIsUIVisible(true), 0);
    return () => clearTimeout(reset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoHide]);

  function handleVideoTap() {
    if (!shouldAutoHide) return;
    setIsUIVisible((v) => {
      const next = !v;
      if (next) scheduleHide();
      return next;
    });
  }

  // Chat toast notifications for incoming (non-self) messages
  useEffect(() => {
    const prev = prevMsgCountRef.current;
    const current = meetChatMessages.length;
    prevMsgCountRef.current = current;
    if (current <= prev) return;
    const incoming = meetChatMessages.slice(prev).filter((m) => m.senderId !== CURRENT_USER_ID);
    incoming.forEach((msg) => {
      const sender = getUserById(msg.senderId);
      const toast: ChatToast = {
        id: msg.id,
        senderName: sender?.name ?? "Participant",
        text: msg.text,
      };
      setChatToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setChatToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, TOAST_DURATION_MS);
    });
  }, [meetChatMessages]);

  // ── Shared render helpers ─────────────────────────────────────────────────

  function reactionLayer(dark: boolean) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {meetReactions.map((reaction) => {
          const user = getUserById(reaction.userId);
          return (
            <div
              key={reaction.id}
              className={cn(
                "absolute bottom-20 flex flex-col items-center gap-1",
                reaction.exiting
                  ? "animate-(--animate-reaction-exit)"
                  : "animate-(--animate-reaction-rise)"
              )}
              style={{ left: `calc(15% + ${reaction.offset}px)` }}
            >
              <span className="text-4xl drop-shadow-md">{reaction.emoji}</span>
              {user && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm",
                    dark ? "bg-black/60 text-white" : "bg-surface/80 text-foreground"
                  )}
                >
                  {reaction.userId === CURRENT_USER_ID ? "You" : user.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function toastLayer() {
    if (chatToasts.length === 0) return null;
    return (
      <div
        className="pointer-events-none absolute bottom-24 left-3 z-10 flex flex-col gap-2"
        aria-live="polite"
      >
        {chatToasts.map((toast) => (
          <div
            key={toast.id}
            className="flex max-w-xs animate-(--animate-slide-up) items-start gap-2 rounded-(--radius-lg) bg-black/70 px-3 py-2 shadow-lg backdrop-blur-sm"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white/70">{toast.senderName}</p>
              <p className="break-words text-sm text-white">{toast.text}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function reactionStrip(dark: boolean) {
    return (
      <div className="flex shrink-0 items-center justify-center gap-2 pb-1 pt-2">
        {DEV_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addMeetReaction(emoji, CURRENT_USER_ID)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-xl shadow-sm transition-transform hover:scale-110 active:scale-95",
              dark ? "bg-white/15 backdrop-blur-sm" : "bg-surface ring-1 ring-border/40"
            )}
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={devSimulateReaction}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
            dark
              ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
              : "bg-secondary text-primary hover:bg-secondary/80"
          )}
        >
          Sim reaction
        </button>
      </div>
    );
  }

  if (!activeMeet) return null;

  // ── Fullscreen immersive ──────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900">
        <div className="absolute inset-0" onClick={handleVideoTap}>
          {activeMeet.isScreenSharing ? (
            <ScreenShareView meet={activeMeet} hideParticipants />
          ) : (
            <MeetGrid
              participants={activeMeet.participants}
              pinnedUserId={activeMeet.pinnedUserId}
              onPinParticipant={pinParticipant}
              layoutMode={layoutMode}
            />
          )}
        </div>

        {reactionLayer(true)}
        {toastLayer()}

        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-opacity duration-300",
            isUIVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <div className="bg-gradient-to-b from-black/50 to-transparent">
            <MeetHeader meet={activeMeet} />
          </div>

          <div className="flex-1" onClick={handleVideoTap} />

          <div className="bg-gradient-to-t from-black/60 to-transparent pb-safe pt-4">
            <div className="flex items-center justify-center gap-2 pb-2 pt-1">
              {DEV_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addMeetReaction(emoji, CURRENT_USER_ID)}
                  className="flex size-10 items-center justify-center rounded-full bg-white/15 text-xl shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={devSimulateReaction}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                Sim
              </button>
            </div>
            <MeetControls />
          </div>
        </div>
      </div>
    );
  }

  // ── Landscape immersive ───────────────────────────────────────────────────
  if (isLandscape) {
    return (
      <div className="fixed inset-0 z-50 flex flex-row bg-slate-900">
        {/* Video area */}
        <div className="relative min-w-0 flex-1" onClick={handleVideoTap}>
          {activeMeet.isScreenSharing ? (
            <ScreenShareView meet={activeMeet} isLandscape onPinParticipant={pinParticipant} />
          ) : (
            <MeetGrid
              participants={activeMeet.participants}
              pinnedUserId={activeMeet.pinnedUserId}
              onPinParticipant={pinParticipant}
              layoutMode={layoutMode}
            />
          )}

          {reactionLayer(true)}
          {toastLayer()}

          {/* Auto-hide UI overlaid on video only */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-opacity duration-300",
              isUIVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="bg-gradient-to-b from-black/50 to-transparent">
              <MeetHeader meet={activeMeet} />
            </div>

            <div className="flex-1" onClick={handleVideoTap} />

            <div className="bg-gradient-to-t from-black/60 to-transparent pb-safe pt-4">
              <div className="flex items-center justify-center gap-2 pb-2 pt-1">
                {DEV_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addMeetReaction(emoji, CURRENT_USER_ID)}
                    className="flex size-10 items-center justify-center rounded-full bg-white/15 text-xl shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={devSimulateReaction}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  Sim
                </button>
              </div>
              <MeetControls />
            </div>
          </div>
        </div>

        {/* Inline side panel — never a Sheet in landscape (avoids backdrop-blur bug) */}
        {isRightPanelOpen && (
          <div className={cn(
            "flex w-64 shrink-0 flex-col border-l border-white/10 bg-background/95 backdrop-blur-md transition-opacity duration-300",
            isUIVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <PanelContent
              rightPanelTab={rightPanelTab}
              openRightPanel={openRightPanel}
              closeRightPanel={closeRightPanel}
              participants={activeMeet.participants}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Portrait / normal layout ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MeetHeader meet={activeMeet} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1">
          {activeMeet.isScreenSharing ? (
            <ScreenShareView meet={activeMeet} onPinParticipant={pinParticipant} />
          ) : (
            <MeetGrid
              participants={activeMeet.participants}
              pinnedUserId={activeMeet.pinnedUserId}
              onPinParticipant={pinParticipant}
              layoutMode={layoutMode}
            />
          )}
        </div>

        {/* Desktop inline side panel */}
        {isRightPanelOpen && (
          <div className="hidden w-80 shrink-0 flex-col border-l border-border bg-surface shadow-(--shadow-md) md:flex">
            <PanelContent
              rightPanelTab={rightPanelTab}
              openRightPanel={openRightPanel}
              closeRightPanel={closeRightPanel}
              participants={activeMeet.participants}
            />
          </div>
        )}
      </div>

      {reactionLayer(false)}
      {toastLayer()}

      {reactionStrip(false)}

      {/* Mobile: full-screen panel replaces video content when open (portrait only) */}
      {isRightPanelOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
          <PanelContent
            rightPanelTab={rightPanelTab}
            openRightPanel={openRightPanel}
            closeRightPanel={closeRightPanel}
            participants={activeMeet.participants}
          />
        </div>
      )}

      <MeetControls />
    </div>
  );
}
