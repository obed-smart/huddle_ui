"use client";

import { useEffect, useRef } from "react";
import type { PresenceStatus } from "@/types";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useMeetStore } from "@/store/useMeetStore";
import { usePresenceStore } from "@/store/usePresenceStore";

const OTHER_USER_IDS = seedUsers.map((u) => u.id).filter((id) => id !== CURRENT_USER_ID);
const RANDOM_STATUSES: PresenceStatus[] = ["online", "away", "busy", "offline"];
const TICK_MS = 12_000;
const IDLE_MS = 60_000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll"] as const;

/** Simulates a live presence feed: randomizes other users' status, and
 * auto-drives the current user's status from call state and activity. */
export function usePresenceSimulator(enabled: boolean) {
  const setOtherStatus = usePresenceStore((s) => s.setStatus);
  const setSelfStatus = useAuthStore((s) => s.setStatus);
  const hasActiveCall = useCallStore((s) => Boolean(s.activeCall));
  const hasActiveMeet = useMeetStore((s) => Boolean(s.activeMeet));
  const isBusy = hasActiveCall || hasActiveMeet;
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const userId = OTHER_USER_IDS[Math.floor(Math.random() * OTHER_USER_IDS.length)];
      const status = RANDOM_STATUSES[Math.floor(Math.random() * RANDOM_STATUSES.length)];
      setOtherStatus(userId, status);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [enabled, setOtherStatus]);

  useEffect(() => {
    if (!enabled) return;

    if (isBusy) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      setSelfStatus("busy");
      return;
    }

    function markActive() {
      setSelfStatus("online");
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setSelfStatus("away"), IDLE_MS);
    }

    function handleVisibility() {
      if (document.hidden) {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        setSelfStatus("away");
      } else {
        markActive();
      }
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive));
    document.addEventListener("visibilitychange", handleVisibility);
    markActive();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
      document.removeEventListener("visibilitychange", handleVisibility);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [enabled, isBusy, setSelfStatus]);
}
