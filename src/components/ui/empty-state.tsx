import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary [&_svg]:size-7">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
