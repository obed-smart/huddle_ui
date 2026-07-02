"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Globe,
  Lock,
  Plus,
  ShieldCheck,
} from "@/components/ui/icons";
import { getInviteUrl } from "@/lib/group-utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { useConversationRequestStore, useRelation } from "@/store/useConversationRequestStore";
import { useChatStore } from "@/store/useChatStore";
import { usePresence } from "@/store/usePresenceStore";
import type { Conversation, GroupMemberRole } from "@/types";

// ── Member row ────────────────────────────────────────────────────────────────

function MemberRow({
  userId,
  role,
  conversationId,
  currentUserRole,
}: {
  userId: string;
  role: GroupMemberRole;
  conversationId: string;
  currentUserRole: GroupMemberRole;
}) {
  const user = getUserById(userId);
  const status = usePresence(userId);
  const updateMemberRole = useChatStore((s) => s.updateMemberRole);
  const relation = useRelation(userId);
  const sendPing = useConversationRequestStore((s) => s.sendPing);

  if (!user) return null;
  const isSelf = userId === CURRENT_USER_ID;
  const canPromote =
    !isSelf &&
    role === "member" &&
    (currentUserRole === "owner" || currentUserRole === "admin");

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-2.5",
        role === "owner" && "border-l-2 border-primary pl-5"
      )}
    >
      <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" presence={status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {isSelf ? "You" : user.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>

      {role === "owner" && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Crown className="size-2.5" />
          Owner
        </span>
      )}
      {role === "admin" && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
          <ShieldCheck className="size-2.5" />
          Admin
        </span>
      )}
      {!isSelf && role === "member" && relation === "none" && (
        <Button size="sm" variant="ghost" onClick={() => sendPing(userId)}>
          Ping
        </Button>
      )}
      {!isSelf && role === "member" && relation === "pending" && (
        <span className="shrink-0 text-xs text-muted-foreground">Pinged</span>
      )}
      {canPromote && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => updateMemberRole(conversationId, userId, "admin")}
        >
          Make admin
        </Button>
      )}
    </div>
  );
}

// ── Add from conversations ────────────────────────────────────────────────────

function AddMemberSection({ conversation }: { conversation: Conversation }) {
  const conversations = useChatStore((s) => s.conversations);
  const addMember = useChatStore((s) => s.addMemberToConversation);

  const contacts = conversations
    .filter((c) => c.type === "dm")
    .map((c) => c.participantIds.find((id) => id !== CURRENT_USER_ID))
    .filter((id): id is string => !!id && !conversation.participantIds.includes(id));

  if (contacts.length === 0) return null;

  return (
    <div>
      <p className="px-6 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Add from conversations
      </p>
      {contacts.map((userId) => {
        const user = getUserById(userId);
        if (!user) return null;
        return (
          <div key={userId} className="flex items-center gap-3 px-6 py-2.5">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addMember(conversation.id, userId)}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface GroupSettingsProps {
  conversation: Conversation;
}

export function GroupSettings({ conversation }: GroupSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(conversation.name ?? "");
  const [description, setDescription] = useState(conversation.description ?? "");
  const [copied, setCopied] = useState(false);

  const updateGroupName = useChatStore((s) => s.updateGroupName);
  const updateGroupDescription = useChatStore((s) => s.updateGroupDescription);
  const toggleGroupPrivacy = useChatStore((s) => s.toggleGroupPrivacy);

  const currentUserRole: GroupMemberRole =
    conversation.memberRoles?.[CURRENT_USER_ID] ??
    (conversation.participantIds[0] === CURRENT_USER_ID ? "owner" : "member");

  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";
  const inviteUrl = conversation.inviteCode ? getInviteUrl(conversation.inviteCode) : undefined;

  function handleSaveName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== conversation.name) {
      updateGroupName(conversation.id, trimmed);
    }
  }

  function handleSaveDescription() {
    updateGroupDescription(conversation.id, description.trim());
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <IconButton
          label="Back to chat"
          onClick={() => router.push(`/chat/${conversation.id}`)}
        >
          <ArrowLeft />
        </IconButton>
        <h1 className="text-sm font-semibold text-foreground">Group settings</h1>
      </header>

      {/* Scrollable body */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">

        {/* Name & description */}
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Group name
            </p>
            {canEdit ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                placeholder="Group name"
              />
            ) : (
              <p className="text-sm font-medium text-foreground">{conversation.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            {canEdit ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveDescription}
                placeholder="What's this group about?"
                rows={3}
                className="w-full resize-none rounded-(--radius-md) border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {conversation.description || "No description"}
              </p>
            )}
          </div>
        </div>

        <div className="mx-6 border-t border-border" />

        {/* Privacy toggle — owner only */}
        {currentUserRole === "owner" && (
          <>
            <div className="px-6 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Privacy
              </p>
              <button
                type="button"
                onClick={() => toggleGroupPrivacy(conversation.id)}
                className="flex w-full items-center gap-4 rounded-(--radius-md) border border-border p-4 text-left transition-colors hover:bg-surface-hover"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  {conversation.isPrivate ? (
                    <Lock className="size-5" />
                  ) : (
                    <Globe className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {conversation.isPrivate ? "Private group" : "Public group"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.isPrivate
                      ? "Only invited members can join — tap to make public"
                      : "Anyone with the link can join — tap to make private"}
                  </p>
                </div>
              </button>
            </div>
            <div className="mx-6 border-t border-border" />
          </>
        )}

        {/* Invite link — public groups, owner/admin */}
        {!conversation.isPrivate && inviteUrl && canEdit && (
          <>
            <div className="px-6 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Invite link
              </p>
              <Input
                readOnly
                value={inviteUrl}
                onFocus={(e) => e.currentTarget.select()}
                trailingSlot={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    aria-label="Copy invite link"
                  >
                    {copied ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                }
              />
            </div>
            <div className="mx-6 border-t border-border" />
          </>
        )}

        {/* Members */}
        <div className="py-2">
          <p className="px-6 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {conversation.participantIds.length} members
          </p>
          {conversation.participantIds.map((userId) => {
            const role: GroupMemberRole =
              conversation.memberRoles?.[userId] ??
              (userId === conversation.participantIds[0] ? "owner" : "member");
            return (
              <MemberRow
                key={userId}
                userId={userId}
                role={role}
                conversationId={conversation.id}
                currentUserRole={currentUserRole}
              />
            );
          })}

          {canEdit && <AddMemberSection conversation={conversation} />}
        </div>

      </div>
    </div>
  );
}
