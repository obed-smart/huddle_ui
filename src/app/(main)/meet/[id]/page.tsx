"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MeetOverlay } from "@/components/meet/MeetOverlay";
import { useMeetStore } from "@/store/useMeetStore";

export default function MeetSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const activeMeet = useMeetStore((s) => s.activeMeet);

  useEffect(() => {
    if (!activeMeet) {
      router.replace(`/chat/${id}`);
    }
  }, [activeMeet, id, router]);

  if (!activeMeet) return null;
  return <MeetOverlay />;
}
