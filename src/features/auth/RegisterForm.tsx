"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormField } from "./AuthFormField";
import { GoogleButton } from "./GoogleButton";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
}

function validate(fields: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}): FieldErrors {
  const errs: FieldErrors = {};
  if (!fields.firstName.trim()) errs.firstName = "First name is required.";
  if (!fields.lastName.trim()) errs.lastName = "Last name is required.";
  const uname = fields.username.trim().replace(/^@/, "");
  if (!uname) errs.username = "Username is required.";
  else if (uname.length < 3) errs.username = "Username must be at least 3 characters.";
  if (!fields.email.trim()) errs.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Enter a valid email address.";
  if (!fields.password) errs.password = "Password is required.";
  else if (fields.password.length < 8) errs.password = "Password must be at least 8 characters.";
  return errs;
}

export function RegisterForm() {
  const router = useRouter();
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearField(key: keyof FieldErrors) {
    if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate({ firstName, lastName, username, email, password });
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    await register({ firstName, lastName, username, email, password });
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
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthFormField
            label="First name"
            type="text"
            autoComplete="given-name"
            placeholder="Jordan"
            leadingIcon={<User />}
            value={firstName}
            error={fieldErrors.firstName}
            onChange={(e) => { setFirstName(e.target.value); clearField("firstName"); }}
          />
          <AuthFormField
            label="Last name"
            type="text"
            autoComplete="family-name"
            placeholder="Casey"
            value={lastName}
            error={fieldErrors.lastName}
            onChange={(e) => { setLastName(e.target.value); clearField("lastName"); }}
          />
        </div>
        <AuthFormField
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="jordancasey"
          leadingIcon={<span className="font-medium">@</span>}
          value={username}
          error={fieldErrors.username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearField("username");
            clearError();
          }}
        />
        <AuthFormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          leadingIcon={<Mail />}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
        />
        <AuthFormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          leadingIcon={<Lock />}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
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
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={isLoading} loading={isLoading} />

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Huddle&apos;s Terms of Service &amp; Privacy Policy.
      </p>
    </div>
  );
}
