import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leadingIcon, trailingSlot, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3.5 flex items-center text-muted-foreground [&_svg]:size-[18px]">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-(--radius-md) border border-input bg-surface px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            leadingIcon && "pl-10",
            trailingSlot && "pr-10",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          {...props}
        />
        {trailingSlot && (
          <span className="absolute right-3 flex items-center">{trailingSlot}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
