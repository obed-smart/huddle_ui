"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) router.replace("/chat");
  }, [hasHydrated, isAuthenticated, router]);

  return <AuthLayout>{children}</AuthLayout>;
}
