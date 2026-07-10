"use client";

import Link from "next/link";
import { Lock, Users } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";

interface GroupInviteCardProps {
  inviteCode: string;
  isOwn: boolean;
}

export function GroupInviteCard({ inviteCode, isOwn }: GroupInviteCardProps) {
  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.inviteCode?.toLowerCase() === inviteCode.toLowerCase())
  );

  if (!conversation) return null;

  const isMember = conversation.participantIds.includes(CURRENT_USER_ID);
  const memberCount = conversation.participantIds.length;

  return (
    <Link
      href={`/join/${inviteCode}`}
      className={cn(
        "mt-2 flex items-start gap-3 rounded-xl border p-3 transition-colors no-underline",
        isOwn
          ? "border-white/20 bg-white/10 hover:bg-white/15"
          : "border-border bg-surface hover:bg-surface-hover"
      )}
    >
      {/* Group icon */}
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        isOwn ? "bg-white/20" : "bg-primary/10"
      )}>
        <Users className={cn("size-5", isOwn ? "text-white" : "text-primary")} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", isOwn ? "text-white" : "text-foreground")}>
          {conversation.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {conversation.isPrivate && (
            <Lock className={cn("size-3 shrink-0", isOwn ? "text-white/60" : "text-muted-foreground")} />
          )}
          <p className={cn("text-xs", isOwn ? "text-white/60" : "text-muted-foreground")}>
            {conversation.isPrivate ? "Private group" : "Group"} · {memberCount} {memberCount === 1 ? "member" : "members"}
          </p>
        </div>

        <span
          className={cn(
            "mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold",
            isMember
              ? isOwn ? "bg-white/20 text-white" : "bg-secondary text-primary"
              : isOwn ? "bg-white text-primary" : "bg-primary text-primary-foreground"
          )}
        >
          {isMember
            ? "Open conversation"
            : conversation.isPrivate
            ? "Request to join →"
            : "Join group →"}
        </span>
      </div>
    </Link>
  );
}
