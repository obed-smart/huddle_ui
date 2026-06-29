"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input, type InputProps } from "@/components/ui/input";

interface AuthFormFieldProps extends Omit<InputProps, "id" | "error"> {
  label: string;
  error?: string;
}

export function AuthFormField({ label, error, trailingSlot, ...inputProps }: AuthFormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        error={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        trailingSlot={trailingSlot}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
