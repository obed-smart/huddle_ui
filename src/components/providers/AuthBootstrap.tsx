"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthBootstrap() {
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);
  useEffect(() => { getCurrentUser(); }, [getCurrentUser]);
  return null;
}
