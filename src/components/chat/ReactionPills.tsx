"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
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
  const entries = Object.entries(reactions).filter(([, userIds]) => userIds.length > 0);
  if (entries.length === 0) return null;

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
          onClick={() => setDetailsOpen(true)}
          aria-label="See who reacted"
          className="flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          •••
        </button>
      </div>

      <Modal open={detailsOpen} onOpenChange={setDetailsOpen} title="Reactions">
        <div className="scrollbar-thin -mx-2 max-h-80 space-y-3 overflow-y-auto px-2">
          {entries.map(([emoji, userIds]) => (
            <div key={emoji}>
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="text-base">{emoji}</span>
                {userIds.length}
              </p>
              <div className="space-y-1.5">
                {userIds.map((userId) => {
                  const user = getUserById(userId);
                  const name = userId === CURRENT_USER_ID ? "You" : user?.name ?? "Unknown";
                  return (
                    <div key={userId} className="flex items-center gap-2">
                      <Avatar name={name} size="xs" />
                      <span className="text-sm text-foreground">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
