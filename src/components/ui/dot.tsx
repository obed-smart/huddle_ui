import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";

const STATUS_CLASSES: Record<PresenceStatus | "typing", string> = {
  online: "bg-presence-online",
  away: "bg-presence-away",
  busy: "bg-destructive",
  offline: "bg-presence-offline",
  typing: "bg-primary",
};

const SIZE_CLASSES = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
} as const;

interface DotProps {
  status: PresenceStatus | "typing";
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Dot({ status, size = "md", className }: DotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        SIZE_CLASSES[size],
        STATUS_CLASSES[status],
        className
      )}
      aria-hidden="true"
    />
  );
}
