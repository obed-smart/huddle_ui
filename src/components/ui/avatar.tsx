import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";
import { UserRound } from "./icons";
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

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

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
          !imageUrl && colorForName(name),
          presence === "online" && pulse && "animate-(--animate-presence-pulse) motion-reduce:animate-none"
        )}
        aria-hidden={Boolean(imageUrl)}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <UserRound className={FALLBACK_ICON_SIZE[size]} strokeWidth={1.5} />
        )}
      </span>
      <span className="sr-only">{name}</span>
      {presence && (
        <Dot
          status={presence}
          size={size === "xs" || size === "sm" ? "sm" : size === "lg" || size === "xl" ? "lg" : "md"}
          className="absolute -right-0.5 -bottom-0.5 ring-2 ring-white"
        />
      )}
    </span>
  );
}
