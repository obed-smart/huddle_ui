import { cn, getInitials } from "@/lib/utils";
import type { PresenceStatus } from "@/types";
import { Dot } from "./dot";

const AVATAR_PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function paletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

const SIZE_MAP = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
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
          "inline-flex select-none items-center justify-center overflow-hidden rounded-full font-heading font-semibold ring-2 ring-white",
          SIZE_MAP[size],
          !imageUrl && paletteFor(name),
          presence === "online" && pulse && "animate-(--animate-presence-pulse) motion-reduce:animate-none"
        )}
        aria-hidden={Boolean(imageUrl)}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          getInitials(name)
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
