"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GroupSettings } from "@/components/group/GroupSettings";
import { useChatStore } from "@/store/useChatStore";

export default function GroupSettingsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === id));

  useEffect(() => {
    if (!conversation || conversation.type !== "group") {
      router.replace(`/chat/${id}`);
    }
  }, [conversation, id, router]);

  if (!conversation || conversation.type !== "group") return null;

  return <GroupSettings key={conversation.id} conversation={conversation} />;
}
