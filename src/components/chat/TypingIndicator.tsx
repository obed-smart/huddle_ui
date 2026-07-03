import { Avatar } from "@/components/ui/avatar";
import { getUserById } from "@/lib/seed-data";

interface TypingIndicatorProps {
  userIds: string[];
  showAvatar: boolean;
}

export function TypingIndicator({ userIds, showAvatar }: TypingIndicatorProps) {
  const user = getUserById(userIds[0]);

  return (
    <div className="flex items-end gap-2.5 animate-(--animate-typing-enter)">
      {showAvatar && <Avatar name={user?.name ?? "Unknown"} size="sm" />}
      <div className="flex flex-col gap-0.5">
        {showAvatar && user && (
          <span className="px-1 text-[11px] text-muted-foreground">
            @{user.username} is typing
          </span>
        )}
        <div className="flex items-center gap-1 rounded-(--radius-lg) bg-bubble-received px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-(--animate-typing-bounce) rounded-full bg-bubble-received-foreground/50 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
