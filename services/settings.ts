"use server";

import { db } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { Role } from "@/lib/types";
import { ROLES } from "@/lib/utils";
import type { CrudState } from "./types-shared";

function fd(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

export async function updateOrgSettings(formData: FormData): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  const { error } = await db(
    `update org_settings set org_name=$1, booking_prefix=$2, time_zone=$3, date_format=$4, default_booking_duration=$5
     where id='00000000-0000-0000-0000-000000000001'`,
    [fd(formData, "org_name"), fd(formData, "booking_prefix"), fd(formData, "time_zone"), fd(formData, "date_format"), Number(fd(formData, "default_booking_duration") || 120)],
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Settings saved." };
}

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function createUser(formData: FormData): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  const email = fd(formData, "email").trim().toLowerCase();
  const full_name = fd(formData, "full_name");
  const role = fd(formData, "role") as Role;
  const password = fd(formData, "password");
  if (!email || !ROLES.includes(role)) return { ok: false, message: "Email and valid role required." };
  if (!password || password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };

  const { rows: existing } = await db("select id from profiles where email = $1", [email]);
  if (existing.length > 0) return { ok: false, message: "A user with this email already exists." };

  const hash = await hashPassword(password);
  const { rows, error } = await db<{ id: string }>(
    "insert into profiles (full_name, email, role, active, password_hash) values ($1,$2,$3,true,$4) returning id",
    [full_name, email, role, hash],
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `User created successfully: ${email}`, id: rows[0].id };
}

export async function updateUserRole(formData: FormData): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  const { error } = await db("update profiles set role=$1 where id=$2", [fd(formData, "role"), fd(formData, "id")]);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Role updated." };
}

export async function toggleUserActive(formData: FormData): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  const { error } = await db("update profiles set active=$1 where id=$2", [formData.get("active") === "true", fd(formData, "id")]);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: formData.get("active") === "true" ? "User activated." : "User deactivated." };
}

export async function deleteUser(formData: FormData): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  const id = fd(formData, "id");
  if (!id) return { ok: false, message: "User ID required." };
  // Prevent deleting yourself
  const current = await getCurrentUser();
  if (current?.id === id) return { ok: false, message: "You cannot delete your own account." };
  const { error } = await db("delete from profiles where id = $1", [id]);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "User deleted permanently." };
}
