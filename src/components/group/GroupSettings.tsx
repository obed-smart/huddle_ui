"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Globe,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  X,
} from "@/components/ui/icons";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { getInviteUrl } from "@/lib/group-utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { useConversationRequestStore, useRelation } from "@/store/useConversationRequestStore";
import { useChatStore } from "@/store/useChatStore";
import { usePresence } from "@/store/usePresenceStore";
import { useGroupStore, useAdminPendingRequests } from "@/store/useGroupStore";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation, GroupMemberRole } from "@/types";

// ── Member profile bottom-sheet ───────────────────────────────────────────────

function MemberSheet({
  userId,
  role,
  conversationId,
  currentUserRole,
  onClose,
}: {
  userId: string;
  role: GroupMemberRole;
  conversationId: string;
  currentUserRole: GroupMemberRole;
  onClose: () => void;
}) {
  const user = getUserById(userId);
  const status = usePresence(userId);
  const relation = useRelation(userId);
  const sendPing = useConversationRequestStore((s) => s.sendPing);
  const updateMemberRole = useChatStore((s) => s.updateMemberRole);
  const removeMember = useChatStore((s) => s.removeMember);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);

  if (!user) return null;

  const isSelf = userId === CURRENT_USER_ID;
  const canManage = !isSelf && (currentUserRole === "owner" || currentUserRole === "admin");
  const canRemove = !isSelf && currentUserRole === "owner";

  function handleRemove() {
    removeMember(conversationId, userId);
    addSystemMessage(conversationId, `${user!.name} was removed from the group`);
    onClose();
  }

  return typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-end" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden />
          <div
            className="relative w-full animate-(--animate-sheet-up) rounded-t-3xl bg-background pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Profile header */}
            <div className="flex items-center gap-4 px-5 pb-4 pt-1">
              <Avatar name={user.name} imageUrl={user.avatarUrl} size="lg" presence={status} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">
                  {isSelf ? "You" : user.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {role === "owner" && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                  <Crown className="size-3" />
                  Owner
                </span>
              )}
              {role === "admin" && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-3" />
                  Admin
                </span>
              )}
            </div>

            {/* Actions */}
            {!isSelf && (
              <div className="border-t border-border">
                {/* Ping */}
                {relation === "none" && (
                  <button
                    type="button"
                    onClick={() => { sendPing(userId); onClose(); }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover active:bg-surface-hover"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary text-base">👋</span>
                    Ping
                  </button>
                )}
                {relation === "pending" && (
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground text-base">👋</span>
                    <span className="text-sm text-muted-foreground">Pinged — waiting for response</span>
                  </div>
                )}

                {/* Admin management */}
                {canManage && role === "admin" && currentUserRole === "owner" && (
                  <button
                    type="button"
                    onClick={() => { updateMemberRole(conversationId, userId, "member"); onClose(); }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover active:bg-surface-hover"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                    </span>
                    Dismiss as admin
                  </button>
                )}
                {canManage && role === "member" && (
                  <button
                    type="button"
                    onClick={() => { updateMemberRole(conversationId, userId, "admin"); onClose(); }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover active:bg-surface-hover"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <ShieldCheck className="size-4 text-primary" />
                    </span>
                    Make group admin
                  </button>
                )}

                {/* Remove from group — owner only */}
                {canRemove && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 active:bg-destructive/5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <UserMinus className="size-4 text-destructive" />
                    </span>
                    Remove from group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )
    : null;
}

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
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user) return null;
  const isSelf = userId === CURRENT_USER_ID;

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 px-6 py-2.5 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover",
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
        {role === "member" && (
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Member</span>
        )}
      </button>

      {sheetOpen && (
        <MemberSheet
          userId={userId}
          role={role}
          conversationId={conversationId}
          currentUserRole={currentUserRole}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}

// ── Invite member dialog ──────────────────────────────────────────────────────

function InviteMemberDialog({
  conversation,
  open,
  onClose,
}: {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
}) {
  const conversations = useChatStore((s) => s.conversations);
  const addMember = useChatStore((s) => s.addMemberToConversation);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const contacts = conversations
    .filter((c) => c.type === "dm")
    .map((c) => c.participantIds.find((id) => id !== CURRENT_USER_ID))
    .filter((id): id is string => !!id && !conversation.participantIds.includes(id));

  function handleInvite(userId: string) {
    if (invitedIds.includes(userId)) return;
    setInvitedIds((prev) => [...prev, userId]);

    const user = getUserById(userId);
    const delay = 3000 + Math.random() * 3000;
    setTimeout(() => {
      addMember(conversation.id, userId);
      addSystemMessage(conversation.id, `@${user?.username ?? userId} has just joined`);
    }, delay);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[70vh] overflow-hidden flex flex-col gap-0 p-0">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>Add member</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite someone from your conversations to join this group.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {contacts.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No contacts available to add.
            </p>
          ) : (
            contacts.map((userId) => {
              const user = getUserById(userId);
              if (!user) return null;
              const invited = invitedIds.includes(userId);
              return (
                <div key={userId} className="flex items-center gap-3 px-6 py-2.5">
                  <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  {invited ? (
                    <span className="shrink-0 text-xs text-primary font-medium">Invited</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleInvite(userId)}>
                      <Plus className="size-3.5" />
                      Invite
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const updateGroupName = useChatStore((s) => s.updateGroupName);
  const updateGroupDescription = useChatStore((s) => s.updateGroupDescription);
  const toggleGroupPrivacy = useChatStore((s) => s.toggleGroupPrivacy);
  const approveRequest = useGroupStore((s) => s.approveRequest);
  const declineRequest = useGroupStore((s) => s.declineRequest);
  const simulateIncomingRequest = useGroupStore((s) => s.simulateIncomingRequest);
  const pendingRequests = useAdminPendingRequests(conversation.id);

  const currentUserRole: GroupMemberRole =
    conversation.memberRoles?.[CURRENT_USER_ID] ??
    (conversation.participantIds[0] === CURRENT_USER_ID ? "owner" : "member");

  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";

  // Simulate a new join request arriving after 7 seconds (admin demo)
  useEffect(() => {
    if (!canEdit || !conversation.isPrivate) return;
    const timer = setTimeout(() => simulateIncomingRequest(conversation.id), 7000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);
  const inviteUrl = conversation.inviteCode ? getInviteUrl(conversation.inviteCode) : undefined;

  const filteredMembers = memberSearch.trim()
    ? conversation.participantIds.filter((id) => {
        const u = getUserById(id);
        if (!u) return false;
        const q = memberSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      })
    : conversation.participantIds;

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

        {/* Join Requests — admin/owner only, private groups */}
        {canEdit && conversation.isPrivate && (
          <>
            <div className="px-6 py-4">
              <div className="mb-3 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Join Requests
                </p>
                {pendingRequests.length > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              {pendingRequests.length === 0 ? (
                <p className="rounded-(--radius-md) border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((req) => {
                    const user = getUserById(req.fromUserId);
                    if (!user) return null;
                    return (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 rounded-(--radius-md) border border-border bg-surface p-3"
                      >
                        <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            @{user.username} · {formatRelativeTime(req.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => approveRequest(req.id)}
                            className="rounded-(--radius-sm) bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => declineRequest(req.id)}
                            className="rounded-(--radius-sm) border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mx-6 border-t border-border" />
          </>
        )}

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
              <div className="flex items-center gap-4">
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
                      ? "Only invited members can join"
                      : "Anyone with the link can join"}
                  </p>
                </div>
                <ToggleSwitch
                  checked={conversation.isPrivate ?? false}
                  onCheckedChange={() => toggleGroupPrivacy(conversation.id)}
                  label={conversation.isPrivate ? "Make public" : "Make private"}
                />
              </div>
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
          <div className="flex items-center justify-between px-6 pb-3 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {conversation.participantIds.length} members
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Add member"
              >
                <Plus className="size-3.5" />
              </button>
            )}
          </div>

          {/* Member search */}
          {conversation.participantIds.length > 4 && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 ring-1 ring-border/50">
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch("")}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredMembers.length === 0 ? (
            <p className="px-6 py-4 text-center text-sm text-muted-foreground">
              No members match &ldquo;{memberSearch}&rdquo;
            </p>
          ) : (
            filteredMembers.map((userId) => {
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
            })
          )}
        </div>

        {canEdit && (
          <InviteMemberDialog
            conversation={conversation}
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
          />
        )}

      </div>
    </div>
  );
}
