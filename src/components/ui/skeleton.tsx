import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-(--radius-md) bg-muted motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}
