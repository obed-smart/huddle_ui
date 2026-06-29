import type { Conversation, PresenceStatus } from "@/types";
import { CURRENT_USER_ID, getUserById } from "@/lib/seed-data";

export function getOtherParticipantIds(conversation: Conversation) {
  return conversation.participantIds.filter((id) => id !== CURRENT_USER_ID);
}

export function getConversationName(conversation: Conversation) {
  if (conversation.type === "group") return conversation.name ?? "Group chat";
  const otherId = getOtherParticipantIds(conversation)[0];
  return getUserById(otherId)?.name ?? "Unknown";
}

export function getConversationMemberNames(conversation: Conversation) {
  return getOtherParticipantIds(conversation)
    .map((id) => getUserById(id)?.name)
    .filter((name): name is string => Boolean(name));
}

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

export function getConversationStatusLine(conversation: Conversation, liveStatus?: PresenceStatus) {
  if (conversation.type === "dm") {
    const otherId = getOtherParticipantIds(conversation)[0];
    const status = liveStatus ?? getUserById(otherId)?.status;
    return status ? STATUS_LABELS[status] : "";
  }
  return `${conversation.participantIds.length} members`;
}
