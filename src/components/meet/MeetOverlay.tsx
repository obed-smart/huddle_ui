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

  if (!activeMeet) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MeetHeader meet={activeMeet} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1">
          {activeMeet.isScreenSharing ? (
            <ScreenShareView meet={activeMeet} />
          ) : (
            <MeetGrid participants={activeMeet.participants} pinnedUserId={activeMeet.pinnedUserId} />
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
