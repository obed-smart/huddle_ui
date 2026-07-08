"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Globe,
  Info,
  Link2,
  Lock,
  MessageSquare,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Video,
  X,
} from "@/components/ui/icons";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { getInviteUrl } from "@/lib/group-utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useConversationRequestStore, useRelation } from "@/store/useConversationRequestStore";
import { useChatStore } from "@/store/useChatStore";
import { usePresence } from "@/store/usePresenceStore";
import { useGroupStore, useAdminPendingRequests } from "@/store/useGroupStore";
import { useCallStore } from "@/store/useCallStore";
import type { Conversation, GroupMemberRole } from "@/types";

// ── Add Member panel (full-screen sub-page) ───────────────────────────────────

function AddMemberPanel({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const conversations = useChatStore((s) => s.conversations);
  const addMember = useChatStore((s) => s.addMemberToConversation);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);

  const contacts = conversations
    .filter((c) => c.type === "dm")
    .map((c) => c.participantIds.find((id) => id !== CURRENT_USER_ID))
    .filter((id): id is string => !!id && !conversation.participantIds.includes(id));

  const filtered = search.trim()
    ? contacts.filter((id) => {
        const u = getUserById(id);
        if (!u) return false;
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      })
    : contacts;

  function handleAdd(userId: string) {
    if (invitedIds.includes(userId)) return;
    setInvitedIds((prev) => [...prev, userId]);
    const user = getUserById(userId);
    const delay = 2500 + Math.random() * 2500;
    setTimeout(() => {
      addMember(conversation.id, userId);
      addSystemMessage(conversation.id, `@${user?.username ?? userId} has just joined`);
    }, delay);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">Add members</h1>
      </header>

      {/* Persistent search bar */}
      <div className="border-b border-border px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 ring-1 ring-border/60 focus-within:ring-primary/50">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
              <UserPlus className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground">No contacts found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? `No results for "${search}"`
                : "All your contacts are already in this group."}
            </p>
          </div>
        ) : (
          filtered.map((userId) => {
            const user = getUserById(userId);
            if (!user) return null;
            const added = invitedIds.includes(userId);
            return (
              <div
                key={userId}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover sm:px-4"
              >
                <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                </div>
                {added ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                    <Check className="size-3" />
                    Added
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(userId)}
                    className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Join Requests panel (full-screen sub-page) ────────────────────────────────

function JoinRequestsPanel({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
  const pendingRequests = useAdminPendingRequests(conversationId);
  const approveRequest = useGroupStore((s) => s.approveRequest);
  const declineRequest = useGroupStore((s) => s.declineRequest);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">Join Requests</h1>
          {pendingRequests.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {pendingRequests.length}
            </span>
          )}
        </div>
      </header>

      {/* Request list */}
      <div className="flex-1 overflow-y-auto">
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
              <UserPlus className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground">No pending requests</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When someone requests to join this group, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="py-2">
            {pendingRequests.map((req) => {
              const u = getUserById(req.fromUserId);
              if (!u) return null;
              return (
                <div key={req.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <Avatar name={u.name} imageUrl={u.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{u.username} · {formatRelativeTime(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => approveRequest(req.id)}
                      className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => declineRequest(req.id)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover"
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
    </div>
  );
}

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
  const router = useRouter();
  const user = getUserById(userId);
  const relation = useRelation(userId);
  const sendPing = useConversationRequestStore((s) => s.sendPing);
  const updateMemberRole = useChatStore((s) => s.updateMemberRole);
  const removeMember = useChatStore((s) => s.removeMember);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);
  const startCall = useCallStore((s) => s.startCall);
  const conversations = useChatStore((s) => s.conversations);

  if (!user) return null;

  const isSelf = userId === CURRENT_USER_ID;
  const canManage = !isSelf && (currentUserRole === "owner" || currentUserRole === "admin");
  const canRemove = !isSelf && currentUserRole === "owner";

  const dmConv = conversations.find(
    (c) =>
      c.type === "dm" &&
      c.participantIds.includes(userId) &&
      c.participantIds.includes(CURRENT_USER_ID)
  );

  function handleMessage() {
    if (dmConv) {
      router.push(`/chat/${dmConv.id}`);
      onClose();
    }
  }

  function handleCall(type: "audio" | "video") {
    if (!dmConv) return;
    startCall(dmConv.id, [CURRENT_USER_ID, userId], type);
    router.push(`/call/${dmConv.id}`);
    onClose();
  }

  function handleRemove() {
    removeMember(conversationId, userId);
    addSystemMessage(conversationId, `${user!.name} was removed from the group`);
    onClose();
  }

  return typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-end" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            className="relative w-full animate-(--animate-sheet-up) rounded-t-3xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-surface text-muted-foreground hover:bg-surface-hover"
            >
              <X className="size-4" />
            </button>

            {/* Avatar + name */}
            <div className="flex flex-col items-center px-6 pb-5 pt-8">
              <span className="relative mb-4 inline-flex size-20 shrink-0">
                <span className="inline-flex size-full items-center justify-center overflow-hidden rounded-full ring-4 ring-background bg-secondary">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{user.name[0]}</span>
                  )}
                </span>
              </span>
              <h2 className="text-lg font-bold text-foreground">{isSelf ? "You" : user.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">@{user.username}</p>
              {role !== "member" && (
                <span className="mt-2 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {role === "owner" ? (
                    <Crown className="size-3" />
                  ) : (
                    <ShieldCheck className="size-3" />
                  )}
                  {role === "owner" ? "Owner" : "Admin"}
                </span>
              )}
            </div>

            {/* Message / Audio / Video */}
            {!isSelf && dmConv && (
              <div className="grid grid-cols-3 gap-3 px-6 pb-4">
                {[
                  {
                    icon: <MessageSquare className="size-5" />,
                    label: "Message",
                    onClick: handleMessage,
                  },
                  {
                    icon: <Phone className="size-5" />,
                    label: "Audio",
                    onClick: () => handleCall("audio"),
                  },
                  {
                    icon: <Video className="size-5" />,
                    label: "Video",
                    onClick: () => handleCall("video"),
                  },
                ].map(({ icon, label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className="flex flex-col items-center gap-1.5 rounded-(--radius-lg) bg-surface py-3.5 text-foreground transition-colors hover:bg-surface-hover active:scale-95"
                  >
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Ping row */}
            {!isSelf && !dmConv && relation === "none" && (
              <div className="border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    sendPing(userId);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  <span className="text-lg">👋</span>
                  Ping
                </button>
              </div>
            )}

            {/* Management actions */}
            {!isSelf && (
              <div className="border-t border-border">
                {canManage && role === "admin" && currentUserRole === "owner" && (
                  <button
                    type="button"
                    onClick={() => {
                      updateMemberRole(conversationId, userId, "member");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="size-5 shrink-0" />
                      Dismiss as admin
                    </span>
                  </button>
                )}
                {canManage && role === "member" && (
                  <button
                    type="button"
                    onClick={() => {
                      updateMemberRole(conversationId, userId, "admin");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />
                      Make group admin
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  <span className="flex items-center gap-3">
                    <Info className="size-5 shrink-0 text-muted-foreground" />
                    Info
                  </span>
                </button>
                {canRemove && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                  >
                    <span className="flex items-center gap-3">
                      <UserMinus className="size-5 shrink-0" />
                      Remove from group
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="h-6" />
          </div>
        </div>,
        document.body
      )
    : null;
}

// ── Member list row ───────────────────────────────────────────────────────────

function MemberListRow({
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
  const isAdmin = role === "owner" || role === "admin";

  return (
    <>
      <button
        type="button"
        onClick={() => !isSelf && setSheetOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors sm:px-4 sm:gap-4",
          !isSelf && "cursor-pointer hover:bg-surface-hover active:bg-surface-hover"
        )}
      >
        <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" presence={status} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {isSelf ? "You" : user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isSelf && isAdmin ? role.charAt(0).toUpperCase() + role.slice(1) : `@${user.username}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isAdmin && (
            <span className="text-xs text-muted-foreground">
              {role === "owner" ? "Owner" : "Admin"}
            </span>
          )}
          {!isSelf && <ChevronRight className="size-4 text-muted-foreground/50" />}
        </div>
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

// ── Main component ────────────────────────────────────────────────────────────

interface GroupSettingsProps {
  conversation: Conversation;
}

export function GroupSettings({ conversation }: GroupSettingsProps) {
  const router = useRouter();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(conversation.name ?? "");
  const [memberSearch, setMemberSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateGroupName = useChatStore((s) => s.updateGroupName);
  const toggleGroupPrivacy = useChatStore((s) => s.toggleGroupPrivacy);
  const simulateIncomingRequest = useGroupStore((s) => s.simulateIncomingRequest);
  const pendingRequests = useAdminPendingRequests(conversation.id);

  const currentUserRole: GroupMemberRole =
    conversation.memberRoles?.[CURRENT_USER_ID] ??
    (conversation.participantIds[0] === CURRENT_USER_ID ? "owner" : "member");
  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";
  const inviteUrl = conversation.inviteCode ? getInviteUrl(conversation.inviteCode) : undefined;

  const sortedMembers = [...conversation.participantIds].sort((a, b) => {
    if (a === CURRENT_USER_ID) return -1;
    if (b === CURRENT_USER_ID) return 1;
    const ra =
      conversation.memberRoles?.[a] ??
      (a === conversation.participantIds[0] ? "owner" : "member");
    const rb =
      conversation.memberRoles?.[b] ??
      (b === conversation.participantIds[0] ? "owner" : "member");
    const weight = (r: GroupMemberRole) => (r === "owner" ? 0 : r === "admin" ? 1 : 2);
    return weight(ra) - weight(rb);
  });

  const filteredMembers = memberSearch.trim()
    ? sortedMembers.filter((id) => {
        const u = getUserById(id);
        if (!u) return false;
        const q = memberSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      })
    : sortedMembers;

  // Simulate incoming request after 7s when admin opens a private group
  useEffect(() => {
    if (!canEdit || !conversation.isPrivate) return;
    const timer = setTimeout(() => simulateIncomingRequest(conversation.id), 7000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  function handleSaveName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== conversation.name) updateGroupName(conversation.id, trimmed);
    setEditingName(false);
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Sub-panel: Add Members
  if (showAddMember) {
    return (
      <AddMemberPanel conversation={conversation} onBack={() => setShowAddMember(false)} />
    );
  }

  // Sub-panel: Join Requests
  if (showJoinRequests) {
    return (
      <JoinRequestsPanel
        conversationId={conversation.id}
        onBack={() => setShowJoinRequests(false)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => router.push(`/chat/${conversation.id}`)}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">Group info</h1>
      </header>

      {/* Scrollable body */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">

        {/* Hero: avatar + name + subtitle */}
        <div className="flex flex-col items-center px-4 pb-4 pt-6 sm:px-6">
          <span className="relative mb-4 inline-flex size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-background bg-secondary shadow-md">
            {conversation.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={conversation.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-3xl font-bold text-primary">
                {(conversation.name ?? "G")[0].toUpperCase()}
              </span>
            )}
          </span>

          {/* Name (editable for admin) */}
          {editingName ? (
            <div className="flex w-full max-w-xs items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="flex-1 border-b-2 border-primary bg-transparent py-1 text-center text-xl font-bold text-foreground outline-none"
              />
              <button type="button" onClick={handleSaveName} className="text-primary">
                <Check className="size-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => canEdit && setEditingName(true)}
              className={cn(
                "flex items-center gap-1.5 text-xl font-bold text-foreground",
                canEdit && "hover:text-primary"
              )}
            >
              <span className="max-w-[200px] truncate sm:max-w-xs">
                {conversation.name ?? "Group"}
              </span>
              {canEdit && <Pencil className="size-3.5 shrink-0 text-muted-foreground" />}
            </button>
          )}

          <p className="mt-1 text-sm text-muted-foreground">
            Group · {conversation.participantIds.length} members
          </p>

          {conversation.description && (
            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground line-clamp-2">
              {conversation.description}
            </p>
          )}
        </div>

        {/* Action buttons: Meet / Add / Search */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-5 sm:gap-3 sm:px-6">
          {[
            {
              icon: <Video className="size-5 sm:size-6" />,
              label: "Meet",
              onClick: () => router.push(`/meet/${conversation.id}`),
              disabled: false,
            },
            {
              icon: <UserPlus className="size-5 sm:size-6" />,
              label: "Add",
              onClick: () => setShowAddMember(true),
              disabled: !canEdit,
            },
            {
              icon: <Search className="size-5 sm:size-6" />,
              label: "Search",
              onClick: () => setShowSearch((v) => !v),
              disabled: false,
            },
          ].map(({ icon, label, onClick, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className="flex flex-col items-center gap-1.5 rounded-(--radius-lg) bg-surface py-3.5 text-foreground transition-colors hover:bg-surface-hover active:scale-95 disabled:opacity-40 sm:py-4"
            >
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Join Requests row — admin/owner, private groups */}
        {canEdit && conversation.isPrivate && (
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setShowJoinRequests(true)}
              className="flex w-full items-center gap-3 px-3 py-4 text-left transition-colors hover:bg-surface-hover sm:px-4 sm:gap-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <UserPlus className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Join Requests</p>
                <p className="text-xs text-muted-foreground">
                  {pendingRequests.length > 0
                    ? `${pendingRequests.length} pending`
                    : "No pending requests"}
                </p>
              </div>
              {pendingRequests.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {pendingRequests.length}
                </span>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
            </button>
          </div>
        )}

        {/* Privacy toggle (owner only) */}
        {currentUserRole === "owner" && (
          <div className="border-t border-border px-3 py-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4">
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
        )}

        {/* Member list */}
        <div className="border-t border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 sm:px-6">
            <span className="text-sm font-semibold text-muted-foreground">
              {conversation.participantIds.length} members
            </span>
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search members"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
          </div>

          {/* Search input */}
          {showSearch && (
            <div className="px-3 pb-3 sm:px-4">
              <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 ring-1 ring-border/50">
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch("")}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Clear"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Invite via link row — admin only */}
          {canEdit && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover sm:px-4 sm:gap-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface">
                {copied ? (
                  <Check className="size-5 text-primary" />
                ) : (
                  <Link2 className="size-5 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {copied ? "Link copied!" : "Invite via link"}
                </span>
                {inviteUrl && (
                  <span className="block truncate text-xs text-muted-foreground">{inviteUrl}</span>
                )}
              </span>
              <Copy className="size-4 shrink-0 text-muted-foreground" />
            </button>
          )}

          {/* Member rows */}
          {filteredMembers.length === 0 ? (
            <p className="px-6 py-6 text-center text-sm text-muted-foreground">
              No members match &ldquo;{memberSearch}&rdquo;
            </p>
          ) : (
            filteredMembers.map((userId) => {
              const role: GroupMemberRole =
                conversation.memberRoles?.[userId] ??
                (userId === conversation.participantIds[0] ? "owner" : "member");
              return (
                <MemberListRow
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

        <div className="h-8" />
      </div>
    </div>
  );
}
