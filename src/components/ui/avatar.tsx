import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";
import { CircleUserRound } from "./icons";
import { Dot } from "./dot";

const SIZE_MAP = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
} as const;

const FALLBACK_ICON_SIZE = {
  xs: "size-3.5",
  sm: "size-4.5",
  md: "size-5.5",
  lg: "size-7",
  xl: "size-9",
} as const;

export type AvatarSize = keyof typeof SIZE_MAP;

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
  pulse?: boolean;
  className?: string;
}

export function Avatar({
  name,
  imageUrl,
  size = "md",
  presence,
  pulse = false,
  className,
}: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex select-none items-center justify-center overflow-hidden rounded-full ring-2 ring-white",
          SIZE_MAP[size],
          !imageUrl && "bg-surface-muted text-muted-foreground",
          presence === "online" && pulse && "animate-(--animate-presence-pulse) motion-reduce:animate-none"
        )}
        aria-hidden={Boolean(imageUrl)}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <CircleUserRound className={FALLBACK_ICON_SIZE[size]} strokeWidth={1.5} />
        )}
      </span>
      <span className="sr-only">{name}</span>
      {presence && (
        <Dot
          status={presence}
          className="absolute -right-0.5 -bottom-0.5 ring-2 ring-white"
        />
      )}
    </span>
  );
}
