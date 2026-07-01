"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Video } from "@/components/ui/icons";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import { useMeetStore } from "@/store/useMeetStore";

const QUICK_MEET_PARTICIPANTS = ["u-jakob", "u-hanna", "u-gustavo"];

export default function MeetIndexPage() {
  const router = useRouter();
  const startMeet = useMeetStore((s) => s.startMeet);

  function handleStart() {
    startMeet("Instant Meeting", [
      { userId: CURRENT_USER_ID, muted: false, cameraOff: false, role: "host" },
      ...QUICK_MEET_PARTICIPANTS.map((userId) => ({
        userId,
        muted: false,
        cameraOff: false,
        role: "member" as const,
      })),
    ], "instant");
    router.push("/meet/instant");
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background p-6">
      <EmptyState
        icon={<Video />}
        title="Start a meeting"
        description="Spin up an instant meeting with video, screen sharing, and chat."
        action={<Button onClick={handleStart}>Start instant meeting</Button>}
      />
    </div>
  );
}
