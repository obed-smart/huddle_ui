import { cn, getInitials } from "@/lib/utils";

const SIZE_MAP = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
} as const;

interface GroupAvatarProps {
  names: string[];
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

const TILE_COLORS = [
  "bg-indigo-200 text-indigo-700",
  "bg-emerald-200 text-emerald-700",
  "bg-amber-200 text-amber-700",
  "bg-rose-200 text-rose-700",
];

export function GroupAvatar({ names, size = "md", className }: GroupAvatarProps) {
  const tiles = names.slice(0, 4);

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-full ring-2 ring-white",
        SIZE_MAP[size],
        className
      )}
    >
      {tiles.map((name, i) => (
        <span
          key={name + i}
          className={cn(
            "flex items-center justify-center font-heading text-[8px] font-semibold leading-none",
            TILE_COLORS[i % TILE_COLORS.length],
            tiles.length === 3 && i === 2 && "col-span-2"
          )}
        >
          {getInitials(name)}
        </span>
      ))}
      <span className="sr-only">{names.join(", ")}</span>
    </span>
  );
}
