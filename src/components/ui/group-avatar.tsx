import { cn } from "@/lib/utils";
import { Users } from "./icons";

const SIZE_MAP = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
} as const;

const ICON_SIZE_MAP = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
];

function colorForNames(names: string[]): string {
  const key = names.join("");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface GroupAvatarProps {
  names: string[];
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function GroupAvatar({ names, size = "md", className }: GroupAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white",
        SIZE_MAP[size],
        colorForNames(names),
        className
      )}
    >
      <Users className={ICON_SIZE_MAP[size]} strokeWidth={1.5} />
      <span className="sr-only">{names.join(", ")}</span>
    </span>
  );
}
