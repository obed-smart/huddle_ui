import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";
import { Dot } from "@/components/ui/dot";

interface OnlineIndicatorProps {
  status: PresenceStatus;
  pulse?: boolean;
  className?: string;
}

/** Absolute-positioned presence dot, meant to sit on the corner of an Avatar. */
export function OnlineIndicator({ status, pulse = true, className }: OnlineIndicatorProps) {
  return (
    <span
      className={cn(
        "absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-white",
        status === "online" && pulse && "animate-(--animate-presence-pulse) motion-reduce:animate-none",
        className
      )}
    >
      <Dot status={status} />
    </span>
  );
}
