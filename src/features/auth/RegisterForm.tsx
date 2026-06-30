"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormField } from "./AuthFormField";
import { GoogleButton } from "./GoogleButton";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

export function RegisterForm() {
  const router = useRouter();
  const { register, loginWithGoogle, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await register({ firstName, lastName, email, password });
    router.push("/chat");
  }

  async function handleGoogle() {
    await loginWithGoogle();
    router.push("/chat");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthFormField
            label="First name"
            type="text"
            autoComplete="given-name"
            placeholder="Jordan"
            leadingIcon={<User />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <AuthFormField
            label="Last name"
            type="text"
            autoComplete="family-name"
            placeholder="Casey"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <AuthFormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          leadingIcon={<Mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthFormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          leadingIcon={<Lock />}
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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

      <GoogleButton onClick={handleGoogle} disabled={isLoading} />

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Huddle&apos;s Terms of Service & Privacy Policy.
      </p>
    </div>
  );
}
