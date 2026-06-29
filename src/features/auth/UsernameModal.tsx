"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";

export function UsernameModal() {
  const { user, needsUsername, setUsername, dismissUsernamePrompt } = useAuthStore();
  const [value, setValue] = useState(user?.username ?? "");

  if (!user) return null;

  function handleSave() {
    const trimmed = value.trim().replace(/^@/, "");
    if (trimmed.length >= 3) setUsername(trimmed);
  }

  return (
    <Modal
      open={needsUsername}
      onOpenChange={(open) => !open && dismissUsernamePrompt()}
      title="Choose your @username"
      description="This is how people will find and mention you in Huddle."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-(--radius-md) bg-surface-muted p-3">
          <Avatar name={user.name} size="md" />
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          leadingIcon={<span className="font-medium">@</span>}
          placeholder="username"
          autoFocus
          minLength={3}
        />

        <div className="flex gap-2.5 pt-1">
          <Button variant="outline" className="flex-1" onClick={dismissUsernamePrompt}>
            Skip for now
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={value.trim().length < 3}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
