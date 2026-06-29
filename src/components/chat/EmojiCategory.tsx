import { cn } from "@/lib/utils";
import type { EmojiCategoryData } from "@/lib/emoji-data";

interface EmojiCategoryProps {
  category: EmojiCategoryData;
  active: boolean;
  onSelect: () => void;
}

export function EmojiCategory({ category, active, onSelect }: EmojiCategoryProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      aria-label={category.label}
      title={category.label}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm) text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-secondary" : "hover:bg-surface-hover"
      )}
    >
      {category.emojis[0]}
    </button>
  );
}
