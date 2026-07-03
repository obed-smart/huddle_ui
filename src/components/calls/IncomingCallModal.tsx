"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Phone, PhoneOff, Video } from "@/components/ui/icons";
import { getConversationName } from "@/lib/conversation-utils";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";

const DEMO_CALL_DELAY_MS = 10_000;
const DEMO_CALL_SESSION_KEY = "huddle:demo-incoming-call-shown";

export function IncomingCallModal() {
  const router = useRouter();
  const incomingCall = useCallStore((s) => s.incomingCall);
  const acceptCall = useCallStore((s) => s.acceptCall);
  const declineCall = useCallStore((s) => s.declineCall);
  const simulateIncomingCall = useCallStore((s) => s.simulateIncomingCall);
  const conversation = useChatStore((s) =>
    incomingCall ? s.conversations.find((c) => c.id === incomingCall.conversationId) : undefined
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(DEMO_CALL_SESSION_KEY)) return;
      sessionStorage.setItem(DEMO_CALL_SESSION_KEY, "1");
      const { activeCall, incomingCall: pending } = useCallStore.getState();
      if (!activeCall && !pending) simulateIncomingCall("c-katie", ["u-emerson", "u-katie"], "video");
    }, DEMO_CALL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [simulateIncomingCall]);

  if (!incomingCall || !conversation) return null;
  const name = getConversationName(conversation);

  function handleAccept() {
    acceptCall();
    router.push(`/call/${incomingCall!.conversationId}`);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && declineCall()}>
      <DialogContent showClose={false} className="flex flex-col items-center gap-4 text-center">
        <Avatar name={name} size="xl" presence="online" pulse />
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            Incoming {incomingCall.type === "video" ? "video" : "audio"} call…
          </p>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <IconButton label="Decline" variant="destructive" size="lg" onClick={declineCall}>
            <PhoneOff />
          </IconButton>
          <IconButton label="Accept" variant="primary" size="lg" onClick={handleAccept}>
            {incomingCall.type === "video" ? <Video /> : <Phone />}
          </IconButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
