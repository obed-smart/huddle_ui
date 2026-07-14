"use client";

import { useEffect } from "react";
import { CURRENT_USER_ID, seedConversations, seedUsers } from "@/lib/seed-data";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import type { NotificationType } from "@/types";

const OTHER_USERS = seedUsers.filter((u) => u.id !== CURRENT_USER_ID);
const MIN_DELAY_MS = 25_000;
const MAX_DELAY_MS = 55_000;

const TEMPLATES: { type: NotificationType; body: (name: string) => string }[] = [
  { type: "mention", body: (name) => `mentioned you: "@${name.split(" ")[0]} take a look at this"` },
];

function getConversationId(userId: string): string | undefined {
  const dm = seedConversations.find(
    (c) => c.type === "dm" && c.participantIds.includes(userId) && c.participantIds.includes(CURRENT_USER_ID)
  );
  if (dm) return dm.id;
  const group = seedConversations.find(
    (c) => c.type === "group" && c.participantIds.includes(userId) && c.participantIds.includes(CURRENT_USER_ID)
  );
  return group?.id;
}

function randomNotification() {
  const user = OTHER_USERS[Math.floor(Math.random() * OTHER_USERS.length)];
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return {
    type: template.type,
    title: user.name,
    body: template.body(user.name),
    userId: user.id,
    conversationId: getConversationId(user.id),
  };
}

/** Simulates push notifications arriving at random intervals, like a live backend would. */
export function useNotificationsSimulator(enabled: boolean) {
  const addNotification = useNotificationsStore((s) => s.addNotification);

  useEffect(() => {
    if (!enabled) return;
    let timeout: ReturnType<typeof setTimeout>;

    function schedule() {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      timeout = setTimeout(() => {
        addNotification(randomNotification());
        schedule();
      }, delay);
    }

    schedule();
    return () => clearTimeout(timeout);
  }, [enabled, addNotification]);
}
