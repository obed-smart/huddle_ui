import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/AuthCard";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = { title: "Create your account — Huddle" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join your team on Huddle — messaging, calls, and meetings in one place."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
