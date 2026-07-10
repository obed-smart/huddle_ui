"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Lock, Users } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useGroupStore, usePendingJoinRequestFor } from "@/store/useGroupStore";

// Large group avatar for the join page (GroupAvatar only goes up to size-12)
function BigGroupAvatar({ name }: { name: string }) {
  const colors = [
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-600",
    "bg-rose-100 text-rose-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const color = colors[hash % colors.length];

  return (
    <div className={cn("flex size-24 items-center justify-center rounded-full ring-4 ring-background shadow-lg", color)}>
      <Users className="size-10" strokeWidth={1.5} />
    </div>
  );
}

export default function JoinGroupPage() {
  const params = useParams();
  const code = (params.code as string) ?? "";
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);

  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.inviteCode?.toLowerCase() === code.toLowerCase())
  );

  const isMember = conversation?.participantIds.includes(CURRENT_USER_ID) ?? false;
  const pendingRequest = usePendingJoinRequestFor(conversation?.id ?? "");
  const joinByCode = useGroupStore((s) => s.joinByCode);

  // "idle" | "requesting" | "pending" | "approved" | "joined"
  const [joinState, setJoinState] = useState<"idle" | "requesting" | "pending" | "approved" | "joined">("idle");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.replace(`/login?redirect=/join/${code}`);
    }
  }, [isCheckingAuth, isAuthenticated, code, router]);

  // Detect admin approval: pending request disappears AND user is now a member
  useEffect(() => {
    if (joinState === "pending" && !pendingRequest && isMember) {
      setJoinState("approved");
    }
  }, [joinState, pendingRequest, isMember]);

  function handleJoin() {
    if (!conversation || joinState === "requesting") return;
    setJoinState("requesting");
    const result = joinByCode(code);
    if (result.status === "joined") {
      setJoinState("joined");
    } else if (result.status === "pending") {
      setJoinState("pending");
    } else if (result.status === "already-member") {
      router.push(`/chat/${result.conversationId}`);
    }
  }

  if (isCheckingAuth || !isAuthenticated) return null;

  // ── Invalid invite link ──────────────────────────────────────────────────
  if (!conversation) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="size-9 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Invalid invite link</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This link may have expired or the group no longer exists.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
          >
            Go to Huddle
          </button>
        </div>
      </Shell>
    );
  }

  const memberCount = conversation.participantIds.length;
  const memberNames = conversation.participantIds
    .map((id) => getUserById(id)?.name ?? id)
    .slice(0, 3)
    .join(", ");
  const extraCount = Math.max(0, memberCount - 3);

  // ── Already a member ────────────────────────────────────────────────────
  if (isMember && joinState === "idle") {
    return (
      <Shell>
        <GroupInfo
          name={conversation.name ?? "Group"}
          memberCount={memberCount}
          memberNames={memberNames}
          extraCount={extraCount}
          description={conversation.description}
          isPrivate={conversation.isPrivate}
        />
        <Notice
          icon={<CheckCircle2 className="size-5 text-success" />}
          color="success"
          title="You're already a member"
          body="You have access to this group."
        />
        <button
          type="button"
          onClick={() => router.push(`/chat/${conversation.id}`)}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
        >
          Open conversation
        </button>
      </Shell>
    );
  }

  // ── Approval state (request accepted after delay) ────────────────────────
  if (joinState === "approved" || (joinState === "joined")) {
    return (
      <Shell>
        <GroupInfo
          name={conversation.name ?? "Group"}
          memberCount={memberCount + 1}
          memberNames={memberNames}
          extraCount={extraCount}
          description={conversation.description}
          isPrivate={conversation.isPrivate}
        />
        <Notice
          icon={<CheckCircle2 className="size-5 text-success" />}
          color="success"
          title="You've been approved!"
          body="Your request was accepted. You can now open the conversation."
        />
        <button
          type="button"
          onClick={() => router.push(`/chat/${conversation.id}`)}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
        >
          Open conversation
        </button>
      </Shell>
    );
  }

  // ── Pending state (request sent, waiting for admin) ───────────────────────
  if (joinState === "pending") {
    return (
      <Shell>
        <GroupInfo
          name={conversation.name ?? "Group"}
          memberCount={memberCount}
          memberNames={memberNames}
          extraCount={extraCount}
          description={conversation.description}
          isPrivate={conversation.isPrivate}
        />
        <Notice
          icon={<Clock className="size-5 text-warning animate-pulse" />}
          color="warning"
          title="Request sent"
          body="Waiting for an admin to approve your request. This usually takes a few seconds in this demo."
        />
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-muted py-3 text-sm font-semibold text-muted-foreground"
        >
          Waiting for approval…
        </button>
      </Shell>
    );
  }

  // ── Default: private locked or public join ────────────────────────────────
  return (
    <Shell>
      <GroupInfo
        name={conversation.name ?? "Group"}
        memberCount={memberCount}
        memberNames={memberNames}
        extraCount={extraCount}
        description={conversation.description}
        isPrivate={conversation.isPrivate}
      />

      {conversation.isPrivate ? (
        <>
          <Notice
            icon={<Lock className="size-5 text-primary" />}
            color="primary"
            title="This group is locked"
            body="Only approved members can join. Send a request and an admin will review it."
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={joinState === "requesting"}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-60"
          >
            Request to join
          </button>
        </>
      ) : (
        <>
          <Notice
            icon={<Users className="size-5 text-success" />}
            color="success"
            title="Open group"
            body="Anyone with this link can join instantly."
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={joinState === "requesting"}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-60"
          >
            Join group
          </button>
        </>
      )}
    </Shell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      {/* Brand mark */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Users className="size-4 text-primary-foreground" />
        </div>
        <span className="font-heading text-lg font-bold text-foreground">Huddle</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-lg)">
        <div className="flex flex-col gap-5">{children}</div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        You&apos;re joining via an invite link. Only use links you trust.
      </p>
    </div>
  );
}

function GroupInfo({
  name,
  memberCount,
  memberNames,
  extraCount,
  description,
  isPrivate,
}: {
  name: string;
  memberCount: number;
  memberNames: string;
  extraCount: number;
  description?: string;
  isPrivate?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BigGroupAvatar name={name} />
      <div>
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
        <div className="mt-1 flex items-center justify-center gap-2">
          {isPrivate && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Lock className="size-2.5" />
              Private
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        {memberNames && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {memberNames}{extraCount > 0 ? ` and ${extraCount} more` : ""}
          </p>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function Notice({
  icon,
  color,
  title,
  body,
}: {
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "destructive";
  title: string;
  body: string;
}) {
  const bg = {
    primary: "bg-primary/8",
    success: "bg-success/8",
    warning: "bg-warning/8",
    destructive: "bg-destructive/8",
  }[color];

  return (
    <div className={cn("flex items-start gap-3 rounded-xl p-3.5", bg)}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
