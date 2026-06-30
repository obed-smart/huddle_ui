"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Avatar name={name} size="xl" presence={isDeclined ? undefined : "online"} pulse={!isDeclined} />
      <div>
        <p className="font-heading text-lg font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{STATUS_LABEL[call.status] ?? "Calling…"}</p>
      </div>
      {!isDeclined && (
        <IconButton label="Cancel call" variant="destructive" size="lg" onClick={handleCancel}>
          <PhoneOff />
        </IconButton>
      )}
    </div>
  );
}
