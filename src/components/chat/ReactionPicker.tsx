"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmojiCategory } from "./EmojiCategory";
import { EmojiGrid } from "./EmojiGrid";
import { Smile } from "@/components/ui/icons";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void;
  align?: "start" | "end";
  className?: string;
}

export function ReactionPicker({ open, onOpenChange, onSelect, align = "start", className }: ReactionPickerProps) {
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const active = EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="React to message"
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground opacity-0 shadow-(--shadow-sm) transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open && "opacity-100",
            className
          )}
        >
          <Smile className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-3">
        <div className="mb-2 flex items-center gap-1 border-b border-border pb-2">
          {EMOJI_CATEGORIES.map((category) => (
            <EmojiCategory
              key={category.id}
              category={category}
              active={category.id === activeId}
              onSelect={() => setActiveId(category.id)}
            />
          ))}
        </div>
        <div className="scrollbar-thin max-h-56 overflow-y-auto">
          <EmojiGrid emojis={active.emojis} onSelect={onSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
