import { forwardRef } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { UserPlus } from "@/components/ui/icons";

interface RequestsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count: number;
}

export const RequestsButton = forwardRef<HTMLButtonElement, RequestsButtonProps>(
  ({ count, ...props }, ref) => {
    return (
      <span className="relative inline-flex">
        <IconButton ref={ref} label="Pings" {...props}>
          <UserPlus />
        </IconButton>
        {count > 0 && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive ring-2 ring-surface" />
        )}
      </span>
    );
  }
);
RequestsButton.displayName = "RequestsButton";
