"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconButton } from "@/components/ui/icon-button";
import { EmojiCategory } from "./EmojiCategory";
import { EmojiGrid } from "./EmojiGrid";
import { Smile } from "@/components/ui/icons";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const active = EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton label="Add emoji">
          <Smile />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
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
