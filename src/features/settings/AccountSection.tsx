"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

export function AccountSection() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <section className="space-y-4 rounded-(--radius-lg) border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">Account</h2>
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="text-sm text-foreground">{user.email}</p>
      </div>
      <Button variant="destructive" onClick={handleLogout}>
        <LogOut />
        Log out
      </Button>
    </section>
  );
}
