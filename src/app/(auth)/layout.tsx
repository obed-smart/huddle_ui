"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) router.replace("/chat");
  }, [isCheckingAuth, isAuthenticated, router]);

  return <AuthLayout>{children}</AuthLayout>;
}
