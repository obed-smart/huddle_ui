"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CallControls } from "./CallControls";
import { OutgoingCallPanel } from "./OutgoingCallPanel";
import { ParticipantTile } from "./ParticipantTile";
import { PipCallLayout } from "./PipCallLayout";
import { CallTimer } from "@/components/shared/CallTimer";
import { ArrowLeft, Maximize2, Minimize2, MoreHorizontal, Search, UserPlus, X } from "@/components/ui/icons";
import { getConversationName } from "@/lib/conversation-utils";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";
import type { CallParticipant } from "@/types";

interface CallOverlayProps {
  conversationId: string;
}

function getGridLayout(count: number, small: boolean): { cols: number; rows: number } {
  const maxCols = small ? 2 : 3;
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: maxCols, rows: small ? 3 : 2 };
  if (count <= 9) return { cols: maxCols, rows: small ? 5 : 3 };
  return { cols: small ? 2 : 4, rows: Math.ceil(count / (small ? 2 : 4)) };
}

function useIsSmallScreen() {
  const [small, setSmall] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : true
  );
  useEffect(() => {
    const handler = () => setSmall(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return small;
}

// Per-tile "..." context menu — opens a bottom-sheet portal
function TileWithMenu({
  participant,
  isPinned,
  onPin,
  className,
}: {
  participant: CallParticipant;
  isPinned: boolean;
  onPin: (id: string | undefined) => void;
  className?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const user = getUserById(participant.userId);

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-(--radius-md)", className)}>
        <ParticipantTile
          participant={participant}
          className={cn("h-full w-full rounded-none", isPinned && "ring-2 ring-primary")}
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"
          aria-label="Tile options"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {sheetOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[150] flex items-end"
            onClick={() => setSheetOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" aria-hidden />
            <div
              className="relative w-full animate-(--animate-sheet-up) rounded-t-3xl bg-background pb-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Participant name */}
              {user && (
                <div className="px-5 pb-3 pt-1">
                  <p className="text-base font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              )}

              <div className="mt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => { onPin(isPinned ? undefined : participant.userId); setSheetOpen(false); }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover active:bg-surface-hover"
                >
                  {isPinned ? (
                    <Minimize2 className="size-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Maximize2 className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  {isPinned ? "Restore grid" : "Make full screen"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// Fluid grid: tiles fill the full available height + width, no wasted space
function FluidGrid({
  participants,
  pinnedUserId,
  onPin,
}: {
  participants: CallParticipant[];
  pinnedUserId?: string;
  onPin: (id: string | undefined) => void;
}) {
  const isSmall = useIsSmallScreen();
  const count = participants.length;
  const { cols, rows } = getGridLayout(count, isSmall);
  const scrollable = count > 9;

  return (
    <div
      className={cn("min-h-0 flex-1", scrollable && "overflow-y-auto")}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: scrollable ? `repeat(${rows}, 180px)` : `repeat(${rows}, 1fr)`,
        gap: "3px",
        padding: "3px",
      }}
    >
      {participants.map((p) => (
        <TileWithMenu
          key={p.userId}
          participant={p}
          isPinned={p.userId === pinnedUserId}
          onPin={onPin}
        />
      ))}
    </div>
  );
}

export function CallOverlay({ conversationId }: CallOverlayProps) {
  const router = useRouter();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [pinnedUserId, setPinnedUserId] = useState<string | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  // Intercept browser/hardware back: go back to chat rather than ending call
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    function handlePopState() {
      window.history.pushState(null, "", window.location.href);
      router.push(`/chat/${conversationId}`);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router, conversationId]);

  const activeCall = useCallStore((s) => s.activeCall);
  const addParticipantById = useCallStore((s) => s.addParticipantById);
  const conversations = useChatStore((s) => s.conversations);
  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId)
  );

  const callableContacts = useMemo(() => {
    if (!activeCall) return [];
    const inCall = new Set(activeCall.participants.map((p) => p.userId));
    const seen = new Set<string>();
    const result: ReturnType<typeof getUserById>[] = [];
    for (const conv of conversations) {
      if (conv.type !== "dm") continue;
      for (const id of conv.participantIds) {
        if (id === CURRENT_USER_ID || inCall.has(id) || seen.has(id)) continue;
        seen.add(id);
        const user = getUserById(id);
        if (user) result.push(user);
      }
    }
    return result;
  }, [activeCall, conversations]);

  const filteredContacts = addSearch.trim()
    ? callableContacts.filter((u) =>
        u?.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        u?.username.toLowerCase().includes(addSearch.toLowerCase())
      )
    : callableContacts;

  function openAddSheet() {
    setShowAddSheet(true);
    setAddSearch("");
    setTimeout(() => searchRef.current?.focus(), 80);
  }

  function closeAddSheet() {
    setShowAddSheet(false);
    setAddSearch("");
  }

  function handleAdd(userId: string) {
    addParticipantById(userId);
    closeAddSheet();
  }

  function handlePin(id: string | undefined) {
    setPinnedUserId(id);
  }

  if (!activeCall) return null;

  const name = conversation ? getConversationName(conversation) : "Call";
  const isLive = activeCall.status === "active";

  const pinnedParticipant = pinnedUserId
    ? activeCall.participants.find((p) => p.userId === pinnedUserId)
    : undefined;
  const unpinnedParticipants = activeCall.participants.filter(
    (p) => p.userId !== pinnedUserId
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.push(`/chat/${conversationId}`)}
          aria-label="Minimize"
          className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 active:scale-95"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          {isLive && activeCall.startedAt && (
            <CallTimer startedAt={activeCall.startedAt} className="text-xs text-white/60" />
          )}
        </div>
        {isLive && (
          <button
            type="button"
            onClick={openAddSheet}
            aria-label="Add participant"
            className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 active:scale-95"
          >
            <UserPlus className="size-5" />
          </button>
        )}
      </header>

      {/* ── 2-person DM: fullscreen PiP ── */}
      {isLive && activeCall.participants.length === 2 ? (
        <PipCallLayout participants={activeCall.participants} />

      ) : isLive && pinnedParticipant ? (
        // ── Pinned: large tile + horizontal filmstrip ──
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-1">
          {/* Pinned tile */}
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-(--radius-lg)">
            <ParticipantTile
              participant={pinnedParticipant}
              className="h-full w-full rounded-none ring-2 ring-primary"
            />
            <button
              type="button"
              onClick={() => setPinnedUserId(undefined)}
              aria-label="Restore grid"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <Minimize2 className="size-4" />
            </button>
          </div>

          {/* Filmstrip */}
          {unpinnedParticipants.length > 0 && (
            <div className="scrollbar-thin flex shrink-0 gap-1 overflow-x-auto">
              {unpinnedParticipants.map((p) => (
                <TileWithMenu
                  key={p.userId}
                  participant={p}
                  isPinned={false}
                  onPin={handlePin}
                  className="h-24 w-36 shrink-0"
                />
              ))}
            </div>
          )}
        </div>

      ) : isLive ? (
        // ── Fluid grid: fills entire available area ──
        <FluidGrid
          participants={activeCall.participants}
          pinnedUserId={pinnedUserId}
          onPin={handlePin}
        />

      ) : (
        // ── Outgoing / connecting / ringing state ──
        <OutgoingCallPanel call={activeCall} name={name} />
      )}

      {isLive && <CallControls conversationId={conversationId} />}

      {/* Add Participant bottom sheet */}
      {showAddSheet &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[120]" onClick={closeAddSheet}>
            <div className="absolute inset-0 bg-black/60" aria-hidden />
            <div
              className="absolute bottom-0 left-0 right-0 animate-(--animate-sheet-up) rounded-t-3xl bg-background shadow-2xl"
              style={{ height: "80vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-1">
                <p className="font-heading text-base font-semibold text-foreground">
                  Add to Call
                </p>
                <button
                  type="button"
                  onClick={closeAddSheet}
                  aria-label="Close"
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 ring-1 ring-border/50">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    placeholder="Search contacts…"
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Contact list */}
              <div
                className="scrollbar-thin overflow-y-auto"
                style={{ height: "calc(80vh - 148px)" }}
              >
                {filteredContacts.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No contacts to add
                  </p>
                ) : (
                  filteredContacts.map((user) => {
                    if (!user) return null;
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdd(user.id)}
                          className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-95"
                        >
                          Call
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
