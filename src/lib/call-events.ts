import { formatDuration } from "@/lib/utils";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import type { CallEvent, CallOutcome, CallSession } from "@/types";

export function describeCallEvent(event: CallEvent) {
  const kind = event.type === "video" ? "Video call" : "Audio call";
  if (event.outcome === "completed") return `${kind} · ${formatDuration(event.durationSeconds ?? 0)}`;
  if (event.outcome === "declined") return event.direction === "outgoing" ? `${kind} declined` : "You declined";
  return event.direction === "outgoing" ? "No answer" : "Missed call";
}

export function logCallEvent(call: CallSession, outcome: CallOutcome) {
  const durationSeconds = call.startedAt
    ? Math.round((Date.now() - new Date(call.startedAt).getTime()) / 1000)
    : undefined;

  useChatStore.getState().addCallMessage(call.conversationId, {
    type: call.type,
    direction: call.direction,
    outcome,
    durationSeconds,
  });

  if (outcome === "completed") return;

  const otherUserId = call.participants.find((p) => p.userId !== CURRENT_USER_ID)?.userId;
  const otherUser = otherUserId ? getUserById(otherUserId) : undefined;
  const kind = call.type === "video" ? "video call" : "audio call";

  if (call.direction === "incoming" && outcome === "missed") {
    useNotificationsStore.getState().addNotification({
      type: "call",
      title: `Missed call from ${otherUser?.name ?? "Someone"}`,
      body: call.type === "video" ? "Video call" : "Audio call",
    });
  } else if (call.direction === "outgoing" && outcome === "declined") {
    useNotificationsStore.getState().addNotification({
      type: "call",
      title: otherUser?.name ?? "Someone",
      body: `Declined your ${kind}`,
    });
  }
}
