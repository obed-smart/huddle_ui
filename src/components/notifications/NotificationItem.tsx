import { cn, formatRelativeTime } from "@/lib/utils";
import type { NotificationItem as NotificationItemType } from "@/types";
import { MessageSquare, Phone, AtSign, Sparkles, UserPlus } from "@/components/ui/icons";

export const TYPE_ICON = {
  message: MessageSquare,
  call: Phone,
  mention: AtSign,
  system: Sparkles,
  ping: UserPlus,
} as const;

export const TYPE_COLOR = {
  message: "bg-secondary text-primary",
  call: "bg-destructive-muted text-rose-600",
  mention: "bg-warning-muted text-amber-600",
  system: "bg-secondary text-primary",
  ping: "bg-secondary text-primary",
} as const;

interface NotificationItemProps {
  notification: NotificationItemType;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = TYPE_ICON[notification.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-(--radius-md) px-3 py-2.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.read && "bg-secondary/40"
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4", TYPE_COLOR[notification.type])}>
        <Icon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{notification.title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">{notification.body}</span>
      </span>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
    </button>
  );
}
