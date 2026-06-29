"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { ProfileSection } from "./ProfileSection";
import { StatusSection } from "./StatusSection";
import { AccountSection } from "./AccountSection";

export function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <IconButton label="Back" className="md:hidden" onClick={() => router.push("/chat")}>
          <ArrowLeft />
        </IconButton>
        <h1 className="font-heading text-lg font-semibold text-foreground">Settings</h1>
      </header>

      <div className="scrollbar-thin mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-5">
          <ProfileSection />
          <StatusSection />
          <AccountSection />
        </div>
      </div>
    </div>
  );
}
