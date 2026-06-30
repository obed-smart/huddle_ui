"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "@/components/ui/icons";
import { useGroupStore } from "@/store/useGroupStore";
import { useUIStore } from "@/store/useUIStore";

function extractCode(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/join\/([A-Za-z0-9]+)\/?$/);
  return match ? match[1] : trimmed;
}

export function JoinGroupModal() {
  const router = useRouter();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const joinByCode = useGroupStore((s) => s.joinByCode);
  const open = activeModal === "join-group";

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      closeModal();
      setValue("");
      setFeedback(null);
    }
  }

  function handleJoin() {
    const code = extractCode(value);
    if (!code) return;

    const result = joinByCode(code);
    switch (result.status) {
      case "not-found":
        setFeedback("No group found for that link or code.");
        break;
      case "already-member":
        handleOpenChange(false);
        router.push(`/chat/${result.conversationId}`);
        break;
      case "joined":
        handleOpenChange(false);
        router.push(`/chat/${result.conversationId}`);
        break;
      case "pending":
        setFeedback("This group is private. Your request to join has been sent.");
        break;
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Join a group"
      description="Paste an invite link or code to join."
    >
      <div className="space-y-3">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFeedback(null);
          }}
          leadingIcon={<Link2 />}
          placeholder="huddle.app/join/ABC1234"
          autoFocus
        />
        {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
        <Button className="w-full" disabled={!value.trim()} onClick={handleJoin}>
          Join group
        </Button>
      </div>
    </Modal>
  );
}
