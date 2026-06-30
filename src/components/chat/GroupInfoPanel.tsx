"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe, Lock } from "@/components/ui/icons";
import { getInviteUrl } from "@/lib/group-utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useConversationRequestStore, useRelation } from "@/store/useConversationRequestStore";
import { usePresence } from "@/store/usePresenceStore";
import type { Conversation } from "@/types";

interface GroupInfoPanelProps {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MemberRow({ userId }: { userId: string }) {
  const user = getUserById(userId);
  const status = usePresence(userId);
  const relation = useRelation(userId);
  const sendPing = useConversationRequestStore((s) => s.sendPing);
  if (!user) return null;

  const isSelf = userId === CURRENT_USER_ID;

  return (
    <div className="flex items-center gap-3 rounded-(--radius-sm) px-2.5 py-2">
      <Avatar name={user.name} size="sm" presence={status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {user.name}
          {isSelf && " (You)"}
        </span>
        <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
      </span>
      {!isSelf && relation === "none" && (
        <Button size="sm" variant="ghost" onClick={() => sendPing(userId)}>
          Ping
        </Button>
      )}
      {!isSelf && relation === "pending" && (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">Pinged</span>
      )}
    </div>
  );
}

export function GroupInfoPanel({ conversation, open, onOpenChange }: GroupInfoPanelProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = conversation.inviteCode ? getInviteUrl(conversation.inviteCode) : undefined;

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={conversation.name ?? "Group info"}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {conversation.isPrivate ? <Lock className="size-4" /> : <Globe className="size-4" />}
          {conversation.isPrivate ? "Private group" : "Public group"}
        </div>

        {inviteUrl && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Invite link</p>
            <Input
              readOnly
              value={inviteUrl}
              onFocus={(e) => e.currentTarget.select()}
              trailingSlot={
                <Button size="sm" variant="ghost" onClick={handleCopy} aria-label="Copy invite link">
                  {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                </Button>
              }
            />
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            {conversation.participantIds.length} members
          </p>
          <div className="scrollbar-thin max-h-64 space-y-0.5 overflow-y-auto">
            {conversation.participantIds.map((userId) => (
              <MemberRow key={userId} userId={userId} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
