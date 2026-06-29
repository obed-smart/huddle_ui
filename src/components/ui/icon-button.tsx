import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  default: "bg-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  filled: "bg-muted text-foreground hover:bg-surface-hover",
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
  ghostOnDark: "bg-white/10 text-white hover:bg-white/20",
} as const;

const SIZE_CLASSES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-[18px]",
  lg: "size-12 [&_svg]:size-5",
} as const;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  active?: boolean;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "default", size = "md", active, label, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          active && variant === "default" && "bg-secondary text-primary",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
