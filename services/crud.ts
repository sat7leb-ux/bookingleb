"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { buildWhatsappMessage } from "@/lib/whatsapp";

export interface CrudState {
  ok: boolean;
  message: string;
  id?: string;
}

// ---- People ----
export async function upsertPerson(formData: FormData): Promise<CrudState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Not signed in." };
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const payload = {
    full_name: formData.get("full_name") as string,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    department: (formData.get("department") as string) || null,
    company: (formData.get("company") as string) || null,
    notes: (formData.get("notes") as string) || null,
    active: formData.get("active") !== "false",
  };
  if (!payload.full_name) return { ok: false, message: "Name is required." };
  if (id) {
    const { error } = await sb.from("people").update(payload).eq("id", id);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Person updated.", id };
  }
  const { data, error } = await sb.from("people").insert(payload).select("id").single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Person added.", id: (data as any).id };
}

export async function archivePerson(id: string): Promise<CrudState> {
  const sb = createAdminClient();
  const { error } = await sb.from("people").update({ active: false }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Person archived." };
}

// ---- Programs ----
export async function upsertProgram(formData: FormData): Promise<CrudState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Not signed in." };
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const payload = {
    name: formData.get("name") as string,
    channel_id: (formData.get("channel_id") as string) || null,
    company: (formData.get("company") as string) || null,
    default_location: (formData.get("default_location") as string) || null,
    default_place_in: (formData.get("default_place_in") as string) || null,
    default_top_camera: (formData.get("default_top_camera") as string) || null,
    notes: (formData.get("notes") as string) || null,
    active: formData.get("active") !== "false",
  };
  if (!payload.name) return { ok: false, message: "Program name is required." };
  if (id) {
    const { error } = await sb.from("programs").update(payload).eq("id", id);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Program updated.", id };
  }
  const { data, error } = await sb.from("programs").insert(payload).select("id").single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Program added.", id: (data as any).id };
}

export async function archiveProgram(id: string): Promise<CrudState> {
  const sb = createAdminClient();
  const { error } = await sb.from("programs").update({ active: false }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Program archived." };
}

export async function archiveChannel(id: string): Promise<CrudState> {
  const sb = createAdminClient();
  const { error } = await sb.from("channels").update({ active: false }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Channel archived." };
}

export async function archiveLocation(id: string): Promise<CrudState> {
  const sb = createAdminClient();
  const { error } = await sb.from("locations").update({ active: false }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Location archived." };
}

// ---- Channels ----
export async function upsertChannel(formData: FormData): Promise<CrudState> {
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!name) return { ok: false, message: "Channel name required." };
  if (id) {
    const { error } = await sb.from("channels").update({ name, active: formData.get("active") !== "false" }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Channel updated.", id };
  }
  const { data, error } = await sb.from("channels").insert({ name }).select("id").single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Channel added.", id: (data as any).id };
}

// ---- Locations ----
export async function upsertLocation(formData: FormData): Promise<CrudState> {
  const sb = createAdminClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const address = (formData.get("address") as string) || null;
  if (!name) return { ok: false, message: "Location name required." };
  if (id) {
    const { error } = await sb.from("locations").update({ name, address, active: formData.get("active") !== "false" }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Location updated.", id };
  }
  const { data, error } = await sb.from("locations").insert({ name, address }).select("id").single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Location added.", id: (data as any).id };
}

// ---- WhatsApp: record a prepared message (honest: status = prepared) ----
export async function recordWhatsapp(bookingId: string, recipient: string, message: string, channel: string): Promise<CrudState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Not signed in." };
  const sb = createAdminClient();
  const { error } = await sb.from("whatsapp_messages").insert({
    booking_id: bookingId,
    recipient,
    message,
    channel,
    status: "prepared",
    created_by: user.id,
  });
  if (error) return { ok: false, message: error.message };
  await sb.from("booking_activity").insert({
    booking_id: bookingId,
    actor_id: user.id,
    action: "WhatsApp prepared",
    description: "Confirmation message prepared (opened in WhatsApp — delivery not confirmed by system).",
  });
  return { ok: true, message: "WhatsApp message prepared and logged." };
}
