"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CallControls } from "./CallControls";
import { OutgoingCallPanel } from "./OutgoingCallPanel";
import { ParticipantTile } from "./ParticipantTile";
import { PipCallLayout } from "./PipCallLayout";
import { CallTimer } from "@/components/shared/CallTimer";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft, Search, UserPlus, X } from "@/components/ui/icons";
import { getConversationName } from "@/lib/conversation-utils";
import { cn, getParticipantGridCols } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";

interface CallOverlayProps {
  conversationId: string;
}

export function CallOverlay({ conversationId }: CallOverlayProps) {
  const router = useRouter();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [pinnedUserId, setPinnedUserId] = useState<string | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  // Intercept browser/hardware back: minimize call rather than ending it
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
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));

  // DM contacts the current user has chatted with (not already in call)
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

  if (!activeCall) return null;

  const name = conversation ? getConversationName(conversation) : "Call";
  const gridCols = getParticipantGridCols(activeCall.participants.length);
  const isLive = activeCall.status === "active";

  // Who to show pinned (if any)
  const pinnedParticipant = pinnedUserId
    ? activeCall.participants.find((p) => p.userId === pinnedUserId)
    : undefined;
  const unpinnedParticipants = activeCall.participants.filter((p) => p.userId !== pinnedUserId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
        <IconButton label="Minimize" onClick={() => router.push(`/chat/${conversationId}`)}>
          <ArrowLeft />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <CallTimer startedAt={activeCall.startedAt} className="text-xs text-muted-foreground" />
        </div>
        {isLive && (
          <IconButton label="Add participant" size="sm" onClick={openAddSheet}>
            <UserPlus />
          </IconButton>
        )}
      </header>

      {isLive && activeCall.participants.length === 2 ? (
        // DM call: full-screen + draggable PiP
        <PipCallLayout participants={activeCall.participants} />
      ) : isLive && pinnedParticipant ? (
        // Pinned speaker view: big tile + filmstrip
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:p-8">
          <ParticipantTile
            participant={pinnedParticipant}
            className="min-h-0 flex-1 ring-2 ring-primary"
            isPinned
            onTogglePin={() => setPinnedUserId(undefined)}
          />
          {unpinnedParticipants.length > 0 && (
            <div className="scrollbar-thin flex shrink-0 gap-3 overflow-x-auto pb-1">
              {unpinnedParticipants.map((p) => (
                <ParticipantTile
                  key={p.userId}
                  participant={p}
                  className="aspect-video w-32 shrink-0"
                  onTogglePin={() => setPinnedUserId(p.userId)}
                />
              ))}
            </div>
          )}
        </div>
      ) : isLive ? (
        // Group call: grid (tap tile to pin)
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 md:p-8">
          <div className={cn("grid w-full max-w-4xl gap-4", gridCols)}>
            {activeCall.participants.map((participant) => (
              <ParticipantTile
                key={participant.userId}
                participant={participant}
                className="aspect-video"
                onTogglePin={() => setPinnedUserId(participant.userId)}
              />
            ))}
          </div>
        </div>
      ) : (
        <OutgoingCallPanel call={activeCall} name={name} />
      )}

      {isLive && <CallControls conversationId={conversationId} />}

      {/* Add Participant bottom sheet */}
      {showAddSheet && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[120]" onClick={closeAddSheet}>
          <div className="absolute inset-0 bg-black/40" aria-hidden />
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
              <p className="font-heading text-base font-semibold text-foreground">Add to Call</p>
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
                  placeholder="Search contacts..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Contact list */}
            <div className="scrollbar-thin overflow-y-auto" style={{ height: "calc(80vh - 148px)" }}>
              {filteredContacts.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">No contacts to add</p>
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
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
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
