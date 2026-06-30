import { BellOff } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "./NotificationItem";
import type { NotificationItem as NotificationItemType } from "@/types";

interface NotificationListProps {
  notifications: NotificationItemType[];
  onSelect: (notification: NotificationItemType) => void;
  className?: string;
}

export function NotificationList({ notifications, onSelect, className }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellOff />}
        title="No notifications"
        description="You're all caught up."
        className="p-6"
      />
    );
  }

  return (
    <div className={className}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => onSelect(notification)}
        />
      ))}
    </div>
  );
}
