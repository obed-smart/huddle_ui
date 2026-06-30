"use client";

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

const TABS = [
  { id: "participants", label: "Participants", icon: Users },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Folder },
] as const;

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

        {isRightPanelOpen && (
          <div className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
            <div className="flex items-center gap-1 border-b border-border p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => openRightPanel(tab.id)}
                  aria-current={rightPanelTab === tab.id}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-(--radius-sm) px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    rightPanelTab === tab.id
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </button>
              ))}
              <IconButton label="Close panel" size="sm" onClick={closeRightPanel}>
                <X />
              </IconButton>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {rightPanelTab === "participants" && (
                <MeetParticipantList participants={activeMeet.participants} />
              )}
              {rightPanelTab === "chat" && <MeetChat />}
              {rightPanelTab === "files" && <FileSharePanel />}
            </div>
          </div>
        )}
      </div>

      <MeetControls />
    </div>
  );
}
