import { forwardRef } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Bell } from "@/components/ui/icons";

interface NotificationBellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount: number;
  active?: boolean;
}

export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ unreadCount, active, ...props }, ref) => {
    return (
      <span className="relative inline-flex">
        <IconButton ref={ref} label="Notifications" active={active} {...props}>
          <Bell />
        </IconButton>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive ring-2 ring-surface" />
        )}
      </span>
    );
  }
);
NotificationBell.displayName = "NotificationBell";
