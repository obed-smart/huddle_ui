"use client";

import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icons";
import { ProfileSection } from "./ProfileSection";
import { StatusSection } from "./StatusSection";
import { AccountSection } from "./AccountSection";
import { useUIStore } from "@/store/useUIStore";

export function SettingsSheet() {
  const { activeModal, closeModal } = useUIStore();
  const open = activeModal === "settings";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeModal()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 md:max-w-md">
        <SheetTitle className="sr-only">Settings</SheetTitle>
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <SheetClose asChild>
            <IconButton label="Close settings">
              <ArrowLeft />
            </IconButton>
          </SheetClose>
          <h2 className="font-heading text-lg font-semibold text-foreground">Settings</h2>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5">
            <ProfileSection />
            <StatusSection />
            <AccountSection />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
