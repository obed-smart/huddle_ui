"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CallOverlay } from "@/components/calls/CallOverlay";
import { useCallStore } from "@/store/useCallStore";

export default function CallSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const activeCall = useCallStore((s) => s.activeCall);

  useEffect(() => {
    if (!activeCall) {
      router.replace(`/chat/${id}`);
    }
  }, [activeCall, id, router]);

  if (!activeCall) return null;
  return <CallOverlay conversationId={id} />;
}
