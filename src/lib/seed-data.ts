import type {
  Conversation,
  Message,
  NotificationItem,
  User,
} from "@/types";

export const CURRENT_USER_ID = "u-emerson";

export const seedUsers: User[] = [
  {
    id: "u-emerson",
    name: "Emerson Dias",
    username: "emersondias",
    email: "emersondias@gmail.com",
    status: "online",
  },
  {
    id: "u-jakob",
    name: "Jakob Schleifer",
    username: "jakobs",
    email: "jakob@huddle.app",
    status: "online",
  },
  {
    id: "u-gustavo",
    name: "Gustavo Donin",
    username: "gustavod",
    email: "gustavo@huddle.app",
    status: "away",
  },
  {
    id: "u-jaydon",
    name: "Jaydon George",
    username: "jaydong",
    email: "jaydon@huddle.app",
    status: "online",
  },
  {
    id: "u-hanna",
    name: "Hanna Lubin",
    username: "hannal",
    email: "hanna@huddle.app",
    status: "online",
  },
  {
    id: "u-skylar",
    name: "Skylar Vetrovs",
    username: "skylarv",
    email: "skylar@huddle.app",
    status: "offline",
  },
  {
    id: "u-katie",
    name: "Katie Mizu",
    username: "katiemizu",
    email: "katie@huddle.app",
    status: "online",
  },
  {
    id: "u-sophia",
    name: "Sophia Carter",
    username: "sophiac",
    email: "sophia@huddle.app",
    status: "away",
  },
];

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const seedConversations: Conversation[] = [
  {
    id: "c-team-meet",
    type: "group",
    name: "Team Meet",
    participantIds: ["u-emerson", "u-jakob", "u-gustavo", "u-jaydon", "u-hanna", "u-skylar"],
    pinned: true,
  },
  {
    id: "c-katie",
    type: "dm",
    participantIds: ["u-emerson", "u-katie"],
  },
  {
    id: "c-jaydon",
    type: "dm",
    participantIds: ["u-emerson", "u-jaydon"],
  },
  {
    id: "c-design",
    type: "group",
    name: "Design Crit",
    participantIds: ["u-emerson", "u-hanna", "u-sophia", "u-skylar"],
  },
  {
    id: "c-sophia",
    type: "dm",
    participantIds: ["u-emerson", "u-sophia"],
  },
];

export const seedMessages: Record<string, Message[]> = {
  "c-team-meet": [
    {
      id: "m-1",
      conversationId: "c-team-meet",
      senderId: "u-jakob",
      text: "First, a quick overview: our objective is clear — develop a solution that's efficient, scalable, and future-ready.",
      createdAt: minutesAgo(58),
      status: "read",
    },
    {
      id: "m-2",
      conversationId: "c-team-meet",
      senderId: "u-jakob",
      text: "Phase one starts now. It includes research, team alignment, and defining deliverables.",
      createdAt: minutesAgo(57),
      status: "read",
    },
    {
      id: "m-3",
      conversationId: "c-team-meet",
      senderId: "u-emerson",
      text: "Good question. We'll discuss the timeline today and decide on the first few milestones together.",
      createdAt: minutesAgo(28),
      status: "read",
    },
    {
      id: "m-4",
      conversationId: "c-team-meet",
      senderId: "u-hanna",
      text: "😊",
      createdAt: minutesAgo(27),
      status: "read",
    },
  ],
  "c-katie": [
    {
      id: "m-5",
      conversationId: "c-katie",
      senderId: "u-katie",
      text: "Did you know who is this guy in the new project thread?",
      createdAt: minutesAgo(40),
      status: "read",
    },
    {
      id: "m-6",
      conversationId: "c-katie",
      senderId: "u-emerson",
      text: "Cool, will let you know ASAP!",
      createdAt: minutesAgo(2),
      status: "delivered",
    },
  ],
  "c-jaydon": [
    {
      id: "m-7",
      conversationId: "c-jaydon",
      senderId: "u-jaydon",
      text: "Hey, where are you? We're starting in 5.",
      createdAt: minutesAgo(15),
      status: "read",
    },
  ],
  "c-design": [
    {
      id: "m-8",
      conversationId: "c-design",
      senderId: "u-sophia",
      text: "Pushed the new component specs to the shared drive.",
      attachments: [
        { id: "a-1", type: "file", name: "design-spec-v3.pdf", size: 2_400_000 },
      ],
      createdAt: minutesAgo(120),
      status: "read",
    },
  ],
  "c-sophia": [
    {
      id: "m-9",
      conversationId: "c-sophia",
      senderId: "u-sophia",
      text: "That so cool, keep it up dude",
      createdAt: minutesAgo(180),
      status: "read",
    },
  ],
};

export const seedNotifications: NotificationItem[] = [
  {
    id: "n-1",
    type: "message",
    title: "Katie Mizu",
    body: "Did you know who is this guy?",
    createdAt: minutesAgo(2),
    read: false,
  },
  {
    id: "n-2",
    type: "call",
    title: "Missed call from Jaydon George",
    body: "Audio call · 1 min ago",
    createdAt: minutesAgo(1),
    read: false,
  },
  {
    id: "n-3",
    type: "mention",
    title: "Hanna Lubin mentioned you",
    body: "in Design Crit",
    createdAt: minutesAgo(34),
    read: false,
  },
  {
    id: "n-4",
    type: "system",
    title: "Weekly summary is ready",
    body: "You sent 128 messages this week",
    createdAt: minutesAgo(600),
    read: true,
  },
];

export function getUserById(id: string): User | undefined {
  return seedUsers.find((u) => u.id === id);
}
