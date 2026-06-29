import { formatDayDivider } from "@/lib/utils";

interface DayDividerProps {
  date: string;
}

export function DayDivider({ date }: DayDividerProps) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {formatDayDivider(date)}
      </span>
    </div>
  );
}
