import type { LoginDto, RegisterDto } from "@/lib/schema.validation";
import type { User } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((body.message as string | undefined) ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function normalizeUser(raw: Record<string, unknown>): User {
  return {
    ...(raw as unknown as User),
    name: (raw.displayName as string | undefined) ?? (raw.name as string) ?? "",
  };
}

export const authService = {
  login: (data: LoginDto) =>
    request<Record<string, unknown>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(normalizeUser),

  register: (data: RegisterDto) =>
    request<Record<string, unknown>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(normalizeUser),

  me: () =>
    request<Record<string, unknown>>("/auth/me").then(normalizeUser),

  logout: () =>
    request<void>("/auth/logout", { method: "POST" }),

  loginWithGoogle: () => {
    window.location.href = `${API_BASE}/auth/google`;
  },
};
