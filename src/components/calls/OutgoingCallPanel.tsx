"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { PhoneOff } from "@/components/ui/icons";
import { useCallStore } from "@/store/useCallStore";
import type { CallSession } from "@/types";

const STATUS_LABEL: Record<string, string> = {
  calling: "Calling…",
  connecting: "Connecting…",
  ringing: "Ringing…",
  declined: "Call declined",
};

interface OutgoingCallPanelProps {
  call: CallSession;
  name: string;
}

export function OutgoingCallPanel({ call, name }: OutgoingCallPanelProps) {
  const router = useRouter();
  const endCall = useCallStore((s) => s.endCall);
  const isDeclined = call.status === "declined";

  function handleCancel() {
    endCall();
    router.push(`/chat/${call.conversationId}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      {/* Pulsing avatar */}
      <div className="relative flex items-center justify-center">
        {!isDeclined && (
          <>
            <span className="absolute size-28 animate-ping rounded-full bg-white/10" />
            <span className="absolute size-36 animate-ping rounded-full bg-white/5 [animation-delay:300ms]" />
            <span className="absolute size-44 animate-ping rounded-full bg-white/[0.03] [animation-delay:600ms]" />
          </>
        )}
        <Avatar name={name} size="xl" presence={isDeclined ? undefined : "online"} />
      </div>

      {/* Name + status */}
      <div className="space-y-2">
        <p className="font-heading text-2xl font-semibold text-white">{name}</p>
        <p className="text-sm font-medium text-white/60">
          {STATUS_LABEL[call.status] ?? "Calling…"}
        </p>
      </div>

      {/* Cancel / declined */}
      {isDeclined ? (
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Close
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancel call"
          className="flex size-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg transition-transform hover:bg-destructive-hover active:scale-95"
        >
          <PhoneOff className="size-6" />
        </button>
      )}
    </div>
  );
}
