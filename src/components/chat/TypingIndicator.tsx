import { Avatar } from "@/components/ui/avatar";
import { getUserById } from "@/lib/seed-data";

interface TypingIndicatorProps {
  userIds: string[];
  showAvatar: boolean;
}

export function TypingIndicator({ userIds, showAvatar }: TypingIndicatorProps) {
  const user = getUserById(userIds[0]);
  const name = user ? (showAvatar ? `@${user.username}` : user.name) : "Someone";

  return (
    <div className="flex items-center gap-2.5 animate-(--animate-typing-enter)">
      {showAvatar && <Avatar name={user?.name ?? "Unknown"} size="sm" />}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-(--animate-typing-bounce) rounded-full bg-muted-foreground/50 motion-reduce:animate-none"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="ml-1">{name} is typing</span>
      </div>
    </div>
  );
}
