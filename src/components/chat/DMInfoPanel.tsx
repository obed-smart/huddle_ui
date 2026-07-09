"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dot } from "@/components/ui/dot";
import { MessageSquare, Phone, Video } from "@/components/ui/icons";
import { getUserById } from "@/lib/seed-data";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { usePresence } from "@/store/usePresenceStore";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "sonner";

interface DMInfoPanelProps {
  userId: string;
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DMInfoPanel({ userId, conversationId, open, onOpenChange }: DMInfoPanelProps) {
  const router = useRouter();
  const user = getUserById(userId);
  const status = usePresence(userId);
  const startCall = useCallStore((s) => s.startCall);
  const activeCall = useCallStore((s) => s.activeCall);
  const activeMeet = useChatStore((s) => s.conversations); // just to check

  if (!user) return null;

  const statusLabel =
    status === "online" ? "Online" :
    status === "away" ? "Away" :
    status === "busy" ? "Do not disturb" : "Offline";

  function handleCall(type: "audio" | "video") {
    if (activeCall) {
      toast.error("End your current call first");
      return;
    }
    startCall(conversationId, [CURRENT_USER_ID, userId], type);
    onOpenChange(false);
    router.push(`/call/${conversationId}`);
  }

  function handleMessage() {
    onOpenChange(false);
    router.push(`/chat/${conversationId}`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-3 border-b border-border px-6 pb-6 pt-8">
          <div className="relative">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size="xl" />
            <span className="absolute -bottom-0.5 -right-0.5">
              <Dot
                status={status ?? "offline"}
                size="lg"
                className="ring-2 ring-white"
              />
            </span>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              className={
                status === "online"
                  ? "size-2 rounded-full bg-presence-online"
                  : status === "away"
                  ? "size-2 rounded-full bg-presence-away"
                  : "size-2 rounded-full bg-presence-offline"
              }
            />
            {statusLabel}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4">
          {[
            { icon: <MessageSquare className="size-5" />, label: "Message", onClick: handleMessage },
            { icon: <Phone className="size-5" />, label: "Audio call", onClick: () => handleCall("audio") },
            { icon: <Video className="size-5" />, label: "Video call", onClick: () => handleCall("video") },
          ].map(({ icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 rounded-(--radius-lg) bg-secondary/60 py-3.5 text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
              <span className="text-primary">{icon}</span>
              <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="border-t border-border px-5 py-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
            <p className="text-sm text-foreground">{user.bio}</p>
          </div>
        )}

        {/* About */}
        {user.about && (
          <div className="border-t border-border px-5 py-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed text-foreground">{user.about}</p>
          </div>
        )}

        {/* Username / contact info */}
        <div className="border-t border-border px-5 py-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Username</p>
          <p className="text-sm text-foreground">@{user.username}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
