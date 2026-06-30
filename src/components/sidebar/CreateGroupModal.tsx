"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Check, Globe, Lock } from "@/components/ui/icons";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";
import { useGroupStore } from "@/store/useGroupStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function CreateGroupModal() {
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const createGroup = useGroupStore((s) => s.createGroup);
  const open = activeModal === "create-group";

  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const candidates = seedUsers.filter((u) => u.id !== CURRENT_USER_ID);

  function reset() {
    setName("");
    setMemberIds([]);
    setIsPrivate(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      closeModal();
      reset();
    }
  }

  function toggleMember(userId: string) {
    setMemberIds((ids) => (ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]));
  }

  function handleCreate() {
    if (!name.trim()) return;
    const conversation = createGroup({ name: name.trim(), memberIds, isPrivate });
    handleOpenChange(false);
    router.push(`/chat/${conversation.id}`);
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="New group"
      description="Add members and choose who can join."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="group-name">Group name</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product Team"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>Privacy</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={cn(
                "flex items-center gap-2 rounded-(--radius-md) border px-3 py-2.5 text-left text-sm transition-colors",
                !isPrivate ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover"
              )}
            >
              <Globe className="size-4 shrink-0" />
              <span>
                <span className="block font-medium">Public</span>
                <span className="block text-xs opacity-80">Anyone with the link joins instantly</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={cn(
                "flex items-center gap-2 rounded-(--radius-md) border px-3 py-2.5 text-left text-sm transition-colors",
                isPrivate ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover"
              )}
            >
              <Lock className="size-4 shrink-0" />
              <span>
                <span className="block font-medium">Private</span>
                <span className="block text-xs opacity-80">Joining requires approval</span>
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Members</Label>
          <div className="scrollbar-thin max-h-56 space-y-0.5 overflow-y-auto rounded-(--radius-md) border border-border p-1">
            {candidates.map((user) => {
              const selected = memberIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleMember(user.id)}
                  className="flex w-full items-center gap-3 rounded-(--radius-sm) px-2.5 py-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <Avatar name={user.name} size="xs" />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{user.name}</span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}
                  >
                    {selected && <Check className="size-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button className="w-full" disabled={!name.trim()} onClick={handleCreate}>
          Create group
        </Button>
      </div>
    </Modal>
  );
}
