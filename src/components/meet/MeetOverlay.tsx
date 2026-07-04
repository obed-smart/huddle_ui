"use client";

import { FileSharePanel } from "./FileSharePanel";
import { MeetChat } from "./MeetChat";
import { MeetControls } from "./MeetControls";
import { MeetGrid } from "./MeetGrid";
import { MeetHeader } from "./MeetHeader";
import { MeetParticipantList } from "./MeetParticipantList";
import { ScreenShareView } from "./ScreenShareView";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Folder, MessageSquare, Users, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useMeetStore } from "@/store/useMeetStore";
import { getUserById, CURRENT_USER_ID } from "@/lib/seed-data";

const DEV_REACTION_EMOJIS = ["👍", "❤️", "🎉", "😂", "🔥", "👏"];

const TABS = [
  { id: "participants", label: "Participants", icon: Users },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Folder },
] as const;

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

  if (!activeMeet) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MeetHeader meet={activeMeet} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1">
          {activeMeet.isScreenSharing ? (
            <ScreenShareView meet={activeMeet} />
          ) : (
            <MeetGrid participants={activeMeet.participants} pinnedUserId={activeMeet.pinnedUserId} onPinParticipant={pinParticipant} layoutMode={layoutMode} />
          )}
        </div>

        {/* Desktop: inline side panel */}
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

      {/* Floating reaction bubbles */}
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
                <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
                  {reaction.userId === CURRENT_USER_ID ? "You" : user.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Dev reaction strip + simulate button */}
      <div className="flex shrink-0 items-center justify-center gap-2 pb-1 pt-2">
        {DEV_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addMeetReaction(emoji, CURRENT_USER_ID)}
            className="flex size-9 items-center justify-center rounded-full bg-surface text-xl shadow-sm transition-transform hover:scale-110 active:scale-95"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={devSimulateReaction}
          className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-secondary/80"
        >
          Sim reaction
        </button>
      </div>

      {/* Mobile: Sheet overlay */}
      <Sheet open={isRightPanelOpen} onOpenChange={(open) => !open && closeRightPanel()}>
        <SheetContent side="right" className="flex flex-col md:hidden">
          <PanelContent
            rightPanelTab={rightPanelTab}
            openRightPanel={openRightPanel}
            closeRightPanel={closeRightPanel}
            participants={activeMeet.participants}
          />
        </SheetContent>
      </Sheet>

      <MeetControls />
    </div>
  );
}
