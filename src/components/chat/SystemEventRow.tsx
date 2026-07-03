import type { Message } from "@/types";

interface SystemEventRowProps {
  message: Message;
}

export function SystemEventRow({ message }: SystemEventRowProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="shrink-0 text-[11px] text-muted-foreground">{message.text}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
