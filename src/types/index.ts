export type PresenceStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: PresenceStatus;
  bio?: string;
  about?: string;
}

export type ConversationType = "dm" | "group";

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  participantIds: string[];
  avatarUrl?: string;
  pinned?: boolean;
}

export type AttachmentType = "image" | "file" | "voice";

export interface Attachment {
  id: string;
  type: AttachmentType;
  url?: string;
  name: string;
  size?: number;
  durationSeconds?: number;
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  attachments?: Attachment[];
  createdAt: string;
  status: MessageStatus;
}

export type CallType = "audio" | "video";
export type CallStatus = "ringing" | "active" | "ended" | "declined" | "missed";

export interface CallParticipant {
  userId: string;
  muted: boolean;
  cameraOff: boolean;
  isSpeaking?: boolean;
}

export interface CallSession {
  id: string;
  conversationId: string;
  type: CallType;
  status: CallStatus;
  participants: CallParticipant[];
  startedAt?: string;
}

export type MeetRole = "host" | "member";

export interface MeetParticipant extends CallParticipant {
  role: MeetRole;
  handRaised?: boolean;
}

export interface MeetSession {
  id: string;
  title: string;
  startedAt: string;
  participants: MeetParticipant[];
  isScreenSharing: boolean;
  screenSharingUserId?: string;
  pinnedUserId?: string;
}

export type NotificationType = "message" | "call" | "mention" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  avatarUrl?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "transferring" | "done" | "declined";
  direction: "incoming" | "outgoing";
}
