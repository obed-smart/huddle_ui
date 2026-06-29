import { Check, CheckCheck, Clock } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { MessageStatus } from "@/types";

interface ReadReceiptProps {
  status: MessageStatus;
  className?: string;
}

export function ReadReceipt({ status, className }: ReadReceiptProps) {
  const Icon = status === "sending" ? Clock : status === "sent" ? Check : CheckCheck;

  return (
    <Icon
      className={cn("size-3.5", status === "read" ? "text-primary" : "text-muted-foreground", className)}
    />
  );
}
