import "server-only";
import { auth } from "@/auth";
import { db } from "./db";
import type { Profile, Role } from "./types";

/**
 * Load the current user from the Auth.js session, then hydrate the profile
 * (role/active) from Postgres. Replaces the old Supabase cookie client.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;
    const { rows } = await db<Profile>(
      "select * from profiles where email = $1",
      [session.user.email.toLowerCase()],
    );
    return (rows[0] as Profile) ?? null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && u.role === "Administrator" && u.active;
}

export async function isManager(): Promise<boolean> {
  const u = await getCurrentUser();
  return (
    !!u &&
    u.active &&
    (u.role === "Administrator" || u.role === "Production Manager")
  );
}

export async function canWrite(): Promise<boolean> {
  const u = await getCurrentUser();
  return (
    !!u &&
    u.active &&
    (u.role === "Administrator" ||
      u.role === "Production Manager" ||
      u.role === "Production User")
  );
}

export async function requireUser(): Promise<Profile> {
  const u = await getCurrentUser();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export function roleRank(role: Role): number {
  switch (role) {
    case "Administrator":
      return 5;
    case "Production Manager":
      return 4;
    case "Production User":
      return 3;
    case "Viewer":
      return 2;
    case "Guest":
      return 1;
  }
}

export async function canEditBooking(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && u.active && roleRank(u.role) >= roleRank("Production User");
}

export async function canDeleteBooking(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && u.active && roleRank(u.role) >= roleRank("Production Manager");
}

export async function canChangeStatus(): Promise<boolean> {
  const u = await getCurrentUser();
  return !!u && u.active && roleRank(u.role) >= roleRank("Production Manager");
}
