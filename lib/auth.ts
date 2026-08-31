import "server-only";
import { createCookieClient } from "./supabase/server";
import type { Profile, Role } from "./types";

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const sb = createCookieClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) return null;
    return profile as Profile;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && u.role === "Administrator" && u.active;
}

export async function requireUser(): Promise<Profile> {
  const u = await getCurrentUser();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export function roleRank(role: Role): number {
  switch (role) {
    case "Administrator":
      return 4;
    case "Production Manager":
      return 3;
    case "Production User":
      return 2;
    case "Viewer":
      return 1;
  }
}
