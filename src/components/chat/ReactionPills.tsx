"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

interface ReactionPillsProps {
  reactions: Record<string, string[]>;
  isOwn: boolean;
  onToggle: (emoji: string) => void;
}

export function ReactionPills({ reactions, isOwn, onToggle }: ReactionPillsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const entries = Object.entries(reactions).filter(([, userIds]) => userIds.length > 0);
  if (entries.length === 0) return null;

  const allReactors: { emoji: string; userId: string }[] = entries.flatMap(([emoji, userIds]) =>
    userIds.map((userId) => ({ emoji, userId }))
  );

  const displayedReactors =
    activeTab === "all"
      ? allReactors
      : allReactors.filter((r) => r.emoji === activeTab);

  return (
    <>
      <div className={cn("flex flex-wrap gap-1 px-1", isOwn && "justify-end")}>
        {entries.map(([emoji, userIds]) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            onContextMenu={(e) => {
              e.preventDefault();
              setActiveTab("all");
              setDetailsOpen(true);
            }}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
              userIds.includes(CURRENT_USER_ID)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-muted text-muted-foreground hover:bg-surface-hover"
            )}
          >
            <span>{emoji}</span>
            <span>{userIds.length}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setActiveTab("all"); setDetailsOpen(true); }}
          aria-label="See who reacted"
          className="flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          •••
        </button>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="flex flex-col p-0 w-full md:max-w-xs">
          <SheetTitle className="sr-only">Reactions</SheetTitle>

          {/* Tab bar: All | per-emoji */}
          <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4 py-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All {allReactors.length}
            </button>
            {entries.map(([emoji, userIds]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setActiveTab(emoji)}
                className={cn(
                  "shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  activeTab === emoji
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{emoji}</span>
                <span>{userIds.length}</span>
              </button>
            ))}
          </div>

          {/* Reactor list */}
          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-4">
            {displayedReactors.map(({ emoji, userId }, i) => {
              const user = getUserById(userId);
              const name = userId === CURRENT_USER_ID ? "You" : (user?.name ?? "Unknown");
              return (
                <div key={`${emoji}-${userId}-${i}`} className="flex items-center gap-3">
                  <Avatar name={name} imageUrl={user?.avatarUrl} size="sm" />
                  <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
                  <span className="text-base">{emoji}</span>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
