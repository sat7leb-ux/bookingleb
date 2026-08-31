"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { ROLES } from "@/lib/utils";

export interface CrudState {
  ok: boolean;
  message: string;
  id?: string;
}

// ---- Org settings ----
export async function updateOrgSettings(formData: FormData): Promise<CrudState> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, message: "Administrator access required." };
  const sb = createAdminClient();
  const payload = {
    org_name: formData.get("org_name") as string,
    booking_prefix: formData.get("booking_prefix") as string,
    time_zone: formData.get("time_zone") as string,
    date_format: formData.get("date_format") as string,
    default_booking_duration: Number(formData.get("default_booking_duration") || 120),
  };
  const { error } = await sb
    .from("org_settings")
    .update(payload)
    .eq("id", "00000000-0000-0000-0000-000000000001");
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Settings saved." };
}

// ---- Users (auth.users + profiles) ----
export async function createUser(formData: FormData): Promise<CrudState> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, message: "Administrator access required." };
  const sb = createAdminClient();
  const email = formData.get("email") as string;
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as Role;
  if (!email || !ROLES.includes(role)) return { ok: false, message: "Email and valid role required." };

  // generate a temporary password (user is told to change it)
  const temp = `Promo-${Math.random().toString(36).slice(2, 8)}Xy9!`;
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: temp,
    email_confirm: true,
    user_metadata: { full_name, role },
  });
  if (error) return { ok: false, message: error.message };
  // ensure profile role is correct (trigger sets Viewer by default)
  await sb.from("profiles").update({ role, full_name, active: true }).eq("id", data.user.id);
  return {
    ok: true,
    message: `User created. Temporary password: ${temp} (share securely; ask them to change it).`,
    id: data.user.id,
  };
}

export async function updateUserRole(formData: FormData): Promise<CrudState> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, message: "Administrator access required." };
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const role = formData.get("role") as Role;
  const { error } = await sb.from("profiles").update({ role }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Role updated." };
}

export async function resetUserPassword(formData: FormData): Promise<CrudState> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, message: "Administrator access required." };
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const temp = `Promo-${Math.random().toString(36).slice(2, 8)}Xy9!`;
  const { error } = await sb.auth.admin.updateUserById(id, { password: temp });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `Password reset. New temp password: ${temp}` };
}

export async function toggleUserActive(formData: FormData): Promise<CrudState> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, message: "Administrator access required." };
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";
  const { error } = await sb.from("profiles").update({ active }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: active ? "User activated." : "User deactivated." };
}
