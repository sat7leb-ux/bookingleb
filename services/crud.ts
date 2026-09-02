"use server";

import { db } from "@/lib/db";
import { getCurrentUser, isAdmin, isManager } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { CrudState } from "./types-shared";

function fd(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

// ---- People ----
export async function upsertPerson(formData: FormData): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  const id = fd(formData, "id");
  const full_name = fd(formData, "full_name");
  if (!full_name) return { ok: false, message: "Name is required." };
  const payload = {
    full_name,
    whatsapp: fd(formData, "whatsapp") || null,
    email: fd(formData, "email") || null,
    department: fd(formData, "department") || null,
    company: fd(formData, "company") || null,
    notes: fd(formData, "notes") || null,
    active: formData.get("active") !== "false",
  };
  if (id) {
    const { error } = await db(
      "update people set full_name=$1, whatsapp=$2, email=$3, department=$4, company=$5, notes=$6, active=$7 where id=$8",
      [payload.full_name, payload.whatsapp, payload.email, payload.department, payload.company, payload.notes, payload.active, id],
    );
    if (error) return { ok: false, message: String((error as any).message) };
    return { ok: true, message: "Person updated.", id };
  }
  const { rows, error } = await db<{ id: string }>(
    "insert into people (full_name, whatsapp, email, department, company, notes) values ($1,$2,$3,$4,$5,$6) returning id",
    [payload.full_name, payload.whatsapp, payload.email, payload.department, payload.company, payload.notes],
  );
  if (error) return { ok: false, message: String((error as any).message) };
  return { ok: true, message: "Person added.", id: rows[0].id };
}

export async function archivePerson(id: string): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  await db("update people set active = false where id = $1", [id]);
  return { ok: true, message: "Person archived." };
}

export async function deletePerson(id: string): Promise<CrudState> {
  if (!(await isAdmin())) return { ok: false, message: "Administrator access required." };
  await db("delete from people where id = $1", [id]);
  return { ok: true, message: "Person deleted." };
}

// ---- Programs ----
export async function upsertProgram(formData: FormData): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  const id = fd(formData, "id");
  const name = fd(formData, "name");
  if (!name) return { ok: false, message: "Program name is required." };
  const payload = [
    name,
    fd(formData, "channel_id") || null,
    fd(formData, "company") || null,
    fd(formData, "default_location") || null,
    fd(formData, "default_place_in") || null,
    fd(formData, "default_top_camera") || null,
    fd(formData, "notes") || null,
    formData.get("active") !== "false",
  ];
  if (id) {
    const { error } = await db(
      "update programs set name=$1, channel_id=$2, company=$3, default_location=$4, default_place_in=$5, default_top_camera=$6, notes=$7, active=$8 where id=$9",
      [...payload, id],
    );
    if (error) return { ok: false, message: String((error as any).message) };
    return { ok: true, message: "Program updated.", id };
  }
  const { rows, error } = await db<{ id: string }>(
    "insert into programs (name, channel_id, company, default_location, default_place_in, default_top_camera, notes) values ($1,$2,$3,$4,$5,$6,$7) returning id",
    payload.slice(0, 7),
  );
  if (error) return { ok: false, message: String((error as any).message) };
  return { ok: true, message: "Program added.", id: rows[0].id };
}

export async function archiveProgram(id: string): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  await db("update programs set active = false where id = $1", [id]);
  return { ok: true, message: "Program archived." };
}

// ---- Channels ----
export async function upsertChannel(formData: FormData): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  const id = fd(formData, "id");
  const name = fd(formData, "name");
  if (!name) return { ok: false, message: "Channel name required." };
  if (id) {
    await db("update channels set name=$1, active=$2 where id=$3", [name, formData.get("active") !== "false", id]);
    return { ok: true, message: "Channel updated.", id };
  }
  const { rows } = await db<{ id: string }>("insert into channels (name) values ($1) returning id", [name]);
  return { ok: true, message: "Channel added.", id: rows[0].id };
}
export async function archiveChannel(id: string): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  await db("update channels set active = false where id = $1", [id]);
  return { ok: true, message: "Channel archived." };
}

// ---- Locations ----
export async function upsertLocation(formData: FormData): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  const id = fd(formData, "id");
  const name = fd(formData, "name");
  if (!name) return { ok: false, message: "Location name required." };
  if (id) {
    await db("update locations set name=$1, address=$2, active=$3 where id=$4", [name, fd(formData, "address") || null, formData.get("active") !== "false", id]);
    return { ok: true, message: "Location updated.", id };
  }
  const { rows } = await db<{ id: string }>("insert into locations (name, address) values ($1,$2) returning id", [name, fd(formData, "address") || null]);
  return { ok: true, message: "Location added.", id: rows[0].id };
}
export async function archiveLocation(id: string): Promise<CrudState> {
  if (!(await isManager())) return { ok: false, message: "Administrator/Manager access required." };
  await db("update locations set active = false where id = $1", [id]);
  return { ok: true, message: "Location archived." };
}

// ---- WhatsApp ----
export async function recordWhatsapp(bookingId: string, recipient: string, message: string, channel: string): Promise<CrudState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Not signed in." };
  await db(
    "insert into whatsapp_messages (booking_id, recipient, message, channel, status, created_by) values ($1,$2,$3,$4,'prepared',$5)",
    [bookingId, recipient, message, channel, user.id],
  );
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,'WhatsApp prepared',$3)", [bookingId, user.id, "Confirmation message prepared (opened in WhatsApp — delivery not confirmed by system)."]);
  return { ok: true, message: "WhatsApp message prepared and logged." };
}
