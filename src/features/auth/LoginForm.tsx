"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormField } from "./AuthFormField";
import { GoogleButton } from "./GoogleButton";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

interface FieldErrors {
  identifier?: string;
  password?: string;
}

function validate(identifier: string, password: string): FieldErrors {
  const errs: FieldErrors = {};
  if (!identifier.trim()) errs.identifier = "Email or username is required.";
  if (!password) errs.password = "Password is required.";
  else if (password.length < 4) errs.password = "Password must be at least 4 characters.";
  return errs;
}

export function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(identifier, password);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    await login({ identifier, password });
    if (useAuthStore.getState().isAuthenticated) router.push("/chat");
  }

  function handleGoogle() {
    loginWithGoogle();
  }

  return (
    <div className="space-y-5">
      {/* Server / request error */}
      {error && (
        <div className="flex items-start gap-2 rounded-(--radius-md) bg-destructive-muted px-3.5 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthFormField
          label="Email or username"
          type="text"
          autoComplete="username"
          placeholder="you@company.com"
          leadingIcon={<Mail />}
          value={identifier}
          error={fieldErrors.identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (fieldErrors.identifier) setFieldErrors((p) => ({ ...p, identifier: undefined }));
            clearError();
          }}
        />
        <AuthFormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          leadingIcon={<Lock />}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            clearError();
          }}
          trailingSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          }
        />

        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={isLoading} loading={isLoading} />
    </div>
  );
}
