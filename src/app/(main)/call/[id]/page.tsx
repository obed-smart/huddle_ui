"use client";

import { useParams, useRouter } from "next/navigation";
import { CallOverlay } from "@/components/calls/CallOverlay";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Phone } from "@/components/ui/icons";
import { useCallStore } from "@/store/useCallStore";

export default function CallSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const activeCall = useCallStore((s) => s.activeCall);

  if (activeCall) return <CallOverlay conversationId={id} />;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background p-6">
      <EmptyState
        icon={<Phone />}
        title="No active call"
        description="This call has ended or hasn't started yet."
        action={<Button onClick={() => router.push("/chat")}>Back to chats</Button>}
      />
    </div>
  );
}
