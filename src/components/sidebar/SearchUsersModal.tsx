"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, UserPlus } from "@/components/ui/icons";
import { UserResultCard } from "./UserResultCard";
import { CURRENT_USER_ID, seedUsers } from "@/lib/seed-data";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";

export function SearchUsersModal() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const startConversationWith = useChatStore((s) => s.startConversationWith);
  const open = activeModal === "search-users";

  const q = query.trim().toLowerCase();
  const results = seedUsers.filter(
    (u) => u.id !== CURRENT_USER_ID && (!q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  );

  function handleOpenChange(next: boolean) {
    if (!next) {
      closeModal();
      setQuery("");
    }
  }

  function handleSelect(userId: string) {
    const conversationId = startConversationWith(userId);
    handleOpenChange(false);
    router.push(`/chat/${conversationId}`);
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Find people"
      description="Search by name or @username to start a chat."
    >
      <div className="space-y-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leadingIcon={<Search />}
          placeholder="Search people"
          autoFocus
        />

        <div className="scrollbar-thin max-h-80 space-y-0.5 overflow-y-auto">
          {results.length === 0 ? (
            <EmptyState
              icon={<UserPlus />}
              title="No people found"
              description={`No results for "${query}"`}
              className="p-6"
            />
          ) : (
            results.map((user) => (
              <UserResultCard key={user.id} user={user} onClick={() => handleSelect(user.id)} />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
