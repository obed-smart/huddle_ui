export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: PresenceStatus;
  bio?: string;
  about?: string;
}

export type ConversationType = "dm" | "group";

export type GroupMemberRole = "owner" | "admin" | "member";

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  participantIds: string[];
  avatarUrl?: string;
  pinned?: boolean;
  isPrivate?: boolean;
  inviteCode?: string;
  memberRoles?: Record<string, GroupMemberRole>;
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

export interface MeetEvent {
  meetId: string;
  title: string;
  startedBy: string;
  endedAt?: string;
  durationSeconds?: number;
}

export interface MessageReplyRef {
  messageId: string;
  senderId: string;
  text?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  attachments?: Attachment[];
  call?: CallEvent;
  meet?: MeetEvent;
  reactions?: Record<string, string[]>;
  replyTo?: MessageReplyRef;
  edited?: boolean;
  isSystem?: boolean;
  createdAt: string;
  status: MessageStatus;
}

export type CallType = "audio" | "video";
export type CallStatus = "calling" | "connecting" | "ringing" | "active" | "ended" | "declined" | "missed";
export type CallDirection = "outgoing" | "incoming";

export interface CallParticipant {
  userId: string;
  muted: boolean;
  cameraOff: boolean;
  isSpeaking?: boolean;
  callStatus?: "calling" | "active";
}

export interface CallSession {
  id: string;
  conversationId: string;
  type: CallType;
  status: CallStatus;
  direction: CallDirection;
  participants: CallParticipant[];
  startedAt?: string;
}

export type CallOutcome = "completed" | "declined" | "missed";

export interface CallEvent {
  type: CallType;
  direction: CallDirection;
  outcome: CallOutcome;
  durationSeconds?: number;
}

export type MeetRole = "host" | "member";

export interface MeetParticipant extends CallParticipant {
  role: MeetRole;
  handRaised?: boolean;
}

export interface MeetSession {
  id: string;
  conversationId: string;
  title: string;
  startedAt: string;
  participants: MeetParticipant[];
  isScreenSharing: boolean;
  screenSharingUserId?: string;
  pinnedUserId?: string;
}

export type NotificationType = "message" | "call" | "mention" | "system" | "ping" | "join-request";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  avatarUrl?: string;
  userId?: string;
  conversationId?: string;
  actionId?: string; // references a Ping or GroupJoinRequest id for inline Accept/Decline
}

export type PingStatus = "pending" | "accepted" | "declined";

export interface Ping {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: PingStatus;
  createdAt: string;
}

export type GroupJoinRequestStatus = "pending" | "accepted" | "declined";

export interface GroupJoinRequest {
  id: string;
  conversationId: string;
  fromUserId: string;
  status: GroupJoinRequestStatus;
  createdAt: string;
}

export interface GroupInvite {
  id: string;
  conversationId: string;
  groupName: string;
  fromUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "transferring" | "done" | "declined";
  direction: "incoming" | "outgoing";
}
