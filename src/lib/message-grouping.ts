import type { Message } from "@/types";

const GROUP_GAP_MS = 5 * 60 * 1000;

export interface DaySegment {
  date: string;
  groups: Message[][];
}

export function groupMessagesByDay(messages: Message[]): DaySegment[] {
  const segments: DaySegment[] = [];

  for (const message of messages) {
    const dayKey = new Date(message.createdAt).toDateString();
    let segment = segments[segments.length - 1];

    if (!segment || new Date(segment.date).toDateString() !== dayKey) {
      segment = { date: message.createdAt, groups: [] };
      segments.push(segment);
    }

    if (message.call || message.meet || message.isSystem) {
      segment.groups.push([message]);
      continue;
    }

    const lastGroup = segment.groups[segment.groups.length - 1];
    const lastMessage = lastGroup?.[lastGroup.length - 1];
    const elapsed = lastMessage
      ? new Date(message.createdAt).getTime() - new Date(lastMessage.createdAt).getTime()
      : Infinity;

    if (
      !lastMessage?.call &&
      !lastMessage?.meet &&
      lastMessage?.senderId === message.senderId &&
      elapsed < GROUP_GAP_MS
    ) {
      lastGroup.push(message);
    } else {
      segment.groups.push([message]);
    }
  }

  return segments;
}
