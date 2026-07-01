"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;

interface SheetContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
  overlayClassName?: string;
}

export function SheetContent({
  className,
  children,
  side = "right",
  overlayClassName,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-(--animate-fade-in)",
          overlayClassName
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex h-full flex-col bg-surface shadow-(--shadow-xl) focus:outline-none",
          side === "left"
            ? "left-0 w-full data-[state=open]:animate-(--animate-slide-in-left)"
            : "right-0 w-full data-[state=open]:animate-(--animate-slide-in-right)",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
