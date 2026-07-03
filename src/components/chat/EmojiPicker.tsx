"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconButton } from "@/components/ui/icon-button";
import { EmojiCategory } from "./EmojiCategory";
import { EmojiGrid } from "./EmojiGrid";
import { Film, Search, Smile } from "@/components/ui/icons";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { cn } from "@/lib/utils";

const MOCK_GIFS = [
  { id: "g1", label: "LOL", color: "bg-amber-400" },
  { id: "g2", label: "OMG", color: "bg-rose-400" },
  { id: "g3", label: "YES!", color: "bg-emerald-400" },
  { id: "g4", label: "NOPE", color: "bg-red-500" },
  { id: "g5", label: "WOW", color: "bg-violet-400" },
  { id: "g6", label: "COOL", color: "bg-blue-400" },
  { id: "g7", label: "HUG", color: "bg-pink-400" },
  { id: "g8", label: "🔥", color: "bg-orange-500" },
  { id: "g9", label: "😭", color: "bg-sky-400" },
  { id: "g10", label: "👏", color: "bg-teal-400" },
  { id: "g11", label: "PARTY", color: "bg-purple-400" },
  { id: "g12", label: "DONE", color: "bg-green-500" },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onGifSelect: () => void;
}

export function EmojiPicker({ onSelect, onGifSelect }: EmojiPickerProps) {
  const [tab, setTab] = useState<"emoji" | "gif">("emoji");
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const [gifSearch, setGifSearch] = useState("");
  const [open, setOpen] = useState(false);
  const active = EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];

  const filteredGifs = gifSearch.trim()
    ? MOCK_GIFS.filter((g) => g.label.toLowerCase().includes(gifSearch.toLowerCase()))
    : MOCK_GIFS;

  function handleGifClick() {
    setOpen(false);
    onGifSelect();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton label="Add emoji or GIF">
          <Smile />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        {/* Tab bar */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab("emoji")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              tab === "emoji"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smile className="size-3.5" />
            Emoji
          </button>
          <button
            type="button"
            onClick={() => setTab("gif")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              tab === "gif"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Film className="size-3.5" />
            GIF
          </button>
        </div>

        {tab === "emoji" ? (
          <div className="p-3">
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
              <EmojiGrid
                emojis={active.emojis}
                onSelect={(e) => {
                  onSelect(e);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="mb-2 flex items-center gap-2 rounded-(--radius-sm) border border-border bg-surface-muted px-2.5 py-1.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search GIFs…"
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="scrollbar-thin grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={handleGifClick}
                  className={cn(
                    "flex aspect-video items-center justify-center rounded-(--radius-sm) font-bold text-white transition-opacity hover:opacity-90",
                    gif.color
                  )}
                >
                  <span className="text-xs font-extrabold tracking-wide drop-shadow">{gif.label}</span>
                </button>
              ))}
              {filteredGifs.length === 0 && (
                <p className="col-span-3 py-4 text-center text-xs text-muted-foreground">No GIFs found</p>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
