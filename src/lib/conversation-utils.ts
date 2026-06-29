import type { Conversation } from "@/types";
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

export function getConversationStatusLine(conversation: Conversation) {
  if (conversation.type === "dm") {
    const otherId = getOtherParticipantIds(conversation)[0];
    const user = getUserById(otherId);
    if (!user) return "";
    return user.status === "online" ? "Online" : user.status === "away" ? "Away" : "Offline";
  }
  return `${conversation.participantIds.length} members`;
}
