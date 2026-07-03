"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/features/landing/LandingPage";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) router.replace("/chat");
  }, [isCheckingAuth, isAuthenticated, router]);

  if (isCheckingAuth || isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="flex size-12 items-center justify-center rounded-(--radius-md) bg-primary font-heading text-lg font-bold text-primary-foreground">
          H
        </div>
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none" />
      </div>
    );
  }

  return <LandingPage />;
}
