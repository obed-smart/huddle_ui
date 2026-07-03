import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const ComposerInput = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={1}
        className={cn(
          "max-h-40 flex-1 resize-none bg-transparent py-[11px] text-sm leading-[1.4] text-foreground placeholder:text-muted-foreground focus-visible:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
ComposerInput.displayName = "ComposerInput";
