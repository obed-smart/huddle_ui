interface EmojiGridProps {
  emojis: string[];
  onSelect: (emoji: string) => void;
}

export function EmojiGrid({ emojis, onSelect }: EmojiGridProps) {
  return (
    <div className="grid grid-cols-8 gap-0.5">
      {emojis.map((emoji, i) => (
        <button
          key={emoji + i}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex size-9 items-center justify-center rounded-(--radius-sm) text-xl transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
