"use server";

import { db, tx } from "@/lib/db";
import { getCurrentUser, canWrite, canDeleteBooking, canChangeStatus } from "@/lib/auth";
import type { Booking } from "@/lib/types";
import type { BookingFormState } from "./types-shared";

export interface BookingInput {
  person_id: string | null;
  program_id: string | null;
  channel_id: string | null;
  production_date: string | null;
  call_time: string | null;
  start_time: string | null;
  end_time: string | null;
  live_recorded: "Live" | "Recorded";
  episode_number: string | null;
  recorded_episodes_count: number | null;
  location_id: string | null;
  extra_notes: string | null;
  guest_ids?: string[];
  requirements?: {
    place_in?: string | null;
    place_in_time?: string | null;
    place_in_location?: string | null;
    place_in_notes?: string | null;
    top_camera?: string | null;
    top_camera_time?: string | null;
    top_camera_location?: string | null;
    top_camera_notes?: string | null;
  };
  transportation?: {
    type: string;
    departure_time?: string | null;
    pickup_location?: string | null;
    driver?: string | null;
    notes?: string | null;
  };
  dress_code?: { code: string; notes?: string | null };
}

export async function detectConflict(
  personId: string | null,
  productionDate: string | null,
  excludeBookingId?: string,
): Promise<{ conflict: boolean; reason?: string; existing?: Booking }> {
  if (!personId || !productionDate) return { conflict: false };
  const clauses = "person_id = $1 and production_date = $2 and confirmation_status <> 'Cancelled'";
  const params: unknown[] = [personId, productionDate];
  if (excludeBookingId) { params.push(excludeBookingId); }
  const { rows } = await db<Booking>(
    `select * from bookings where ${clauses}${excludeBookingId ? " and id <> $3" : ""} limit 1`,
    params,
  );
  if (rows.length > 0) {
    const ex = rows[0];
    return {
      conflict: true,
      reason: `This guest already has a booking on ${productionDate} (${ex.call_time ?? "—"} — ${ex.booking_number}).`,
      existing: ex,
    };
  }
  return { conflict: false };
}

async function upsertGuests(bookingId: string, input: BookingInput, userId: string) {
  const ids = Array.from(new Set((input.guest_ids ?? []).filter(Boolean)));
  if (ids.length === 0 && input.person_id) ids.push(input.person_id);
  await db("delete from booking_guests where booking_id = $1", [bookingId]);
  for (const pid of ids) {
    const role = pid === input.person_id ? "Primary guest" : "Guest";
    await db("insert into booking_guests (booking_id, person_id, role) values ($1,$2,$3) on conflict do nothing", [bookingId, pid, role]);
  }
}

async function insertBooking(input: BookingInput, userId: string): Promise<string> {
  const { rows } = await db<{ id: string }>(
    `insert into bookings
       (person_id, program_id, channel_id, production_date, call_time, start_time, end_time,
        live_recorded, episode_number, recorded_episodes_count, location_id, extra_notes, created_by, confirmation_status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'Pending Confirmation')
     returning id`,
    [
      input.person_id, input.program_id, input.channel_id, input.production_date,
      input.call_time, input.start_time, input.end_time, input.live_recorded,
      input.episode_number, input.recorded_episodes_count, input.location_id,
      input.extra_notes, userId,
    ],
  );
  return rows[0].id;
}

async function upsertChildren(bookingId: string, input: BookingInput) {
  if (input.requirements) {
    await db(
      `insert into production_requirements (booking_id, place_in, place_in_time, place_in_location, place_in_notes, top_camera, top_camera_time, top_camera_location, top_camera_notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (booking_id) do update set
         place_in=excluded.place_in, place_in_time=excluded.place_in_time, place_in_location=excluded.place_in_location,
         place_in_notes=excluded.place_in_notes, top_camera=excluded.top_camera, top_camera_time=excluded.top_camera_time,
         top_camera_location=excluded.top_camera_location, top_camera_notes=excluded.top_camera_notes`,
      [bookingId, input.requirements.place_in ?? null, input.requirements.place_in_time ?? null, input.requirements.place_in_location ?? null, input.requirements.place_in_notes ?? null, input.requirements.top_camera ?? null, input.requirements.top_camera_time ?? null, input.requirements.top_camera_location ?? null, input.requirements.top_camera_notes ?? null],
    );
  }
  if (input.transportation) {
    await db(
      `insert into transportation (booking_id, type, departure_time, pickup_location, driver, notes)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (booking_id) do update set type=excluded.type, departure_time=excluded.departure_time, pickup_location=excluded.pickup_location, driver=excluded.driver, notes=excluded.notes`,
      [bookingId, input.transportation.type, input.transportation.departure_time ?? null, input.transportation.pickup_location ?? null, input.transportation.driver ?? null, input.transportation.notes ?? null],
    );
  }
  if (input.dress_code) {
    await db(
      `insert into dress_codes (booking_id, code, notes) values ($1,$2,$3)
       on conflict (booking_id) do update set code=excluded.code, notes=excluded.notes`,
      [bookingId, input.dress_code.code, input.dress_code.notes ?? null],
    );
  }
}

export async function createBooking(input: BookingInput): Promise<BookingFormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You must be signed in." };
  if (!(await canWrite())) return { ok: false, message: "You do not have permission to create bookings." };
  const id = await insertBooking(input, user.id);
  await upsertChildren(id, input);
  await upsertGuests(id, input, user.id);
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,'Booking created',$3)", [id, user.id, `Booking created by ${user.full_name || user.email}`]);
  return { ok: true, message: "Booking created successfully.", bookingId: id };
}

export async function updateBooking(id: string, input: BookingInput): Promise<BookingFormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You must be signed in." };
  if (!(await canWrite())) return { ok: false, message: "You do not have permission to update bookings." };
  await db(
    `update bookings set person_id=$1, program_id=$2, channel_id=$3, production_date=$4, call_time=$5, start_time=$6,
       end_time=$7, live_recorded=$8, episode_number=$9, recorded_episodes_count=$10, location_id=$11, extra_notes=$12
     where id=$13`,
    [input.person_id, input.program_id, input.channel_id, input.production_date, input.call_time, input.start_time, input.end_time, input.live_recorded, input.episode_number, input.recorded_episodes_count, input.location_id, input.extra_notes, id],
  );
  await upsertChildren(id, input);
  await upsertGuests(id, input, user.id);
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,'Booking updated',$3)", [id, user.id, `Booking updated by ${user.full_name || user.email}`]);
  return { ok: true, message: "Booking updated successfully.", bookingId: id };
}

export async function duplicateBooking(id: string): Promise<BookingFormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You must be signed in." };
  if (!(await canWrite())) return { ok: false, message: "Permission denied." };
  const { rows: src } = await db<Booking>("select * from bookings where id = $1", [id]);
  if (!src[0]) return { ok: false, message: "Source booking not found." };
  const s = src[0];
  const newId = await insertBooking(
    {
      person_id: s.person_id, program_id: s.program_id, channel_id: s.channel_id,
      production_date: s.production_date, call_time: s.call_time, start_time: s.start_time,
      end_time: s.end_time, live_recorded: s.live_recorded, episode_number: s.episode_number,
      recorded_episodes_count: s.recorded_episodes_count, location_id: s.location_id,
      extra_notes: s.extra_notes,
    },
    user.id,
  );
  const { rows: req } = await db("select * from production_requirements where booking_id = $1", [id]);
  const { rows: transp } = await db("select * from transportation where booking_id = $1", [id]);
  const { rows: dress } = await db("select * from dress_codes where booking_id = $1", [id]);
  if (req[0]) await db("insert into production_requirements (booking_id, place_in, place_in_time, place_in_location, place_in_notes, top_camera, top_camera_time, top_camera_location, top_camera_notes) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [newId, req[0].place_in, req[0].place_in_time, req[0].place_in_location, req[0].place_in_notes, req[0].top_camera, req[0].top_camera_time, req[0].top_camera_location, req[0].top_camera_notes]);
  if (transp[0]) await db("insert into transportation (booking_id, type, departure_time, pickup_location, driver, notes) values ($1,$2,$3,$4,$5,$6)", [newId, transp[0].type, transp[0].departure_time, transp[0].pickup_location, transp[0].driver, transp[0].notes]);
  if (dress[0]) await db("insert into dress_codes (booking_id, code, notes) values ($1,$2,$3)", [newId, dress[0].code, dress[0].notes]);
  const { rows: srcGuests } = await db("select person_id, role, notes from booking_guests where booking_id = $1", [id]);
  for (const g of srcGuests) {
    await db("insert into booking_guests (booking_id, person_id, role, notes) values ($1,$2,$3,$4) on conflict do nothing", [newId, g.person_id, g.role, g.notes]);
  }
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,'Booking created',$3)", [newId, user.id, `Duplicated from ${s.booking_number}`]);
  return { ok: true, message: "Booking duplicated (new pending booking).", bookingId: newId };
}

export async function setBookingStatus(id: string, status: Booking["confirmation_status"], note?: string): Promise<BookingFormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You must be signed in." };
  if (!(await canChangeStatus())) return { ok: false, message: "Only Administrators can change booking status." };
  await db("update bookings set confirmation_status = $1 where id = $2", [status, id]);
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,$3,$4)", [id, user.id, `Status → ${status}`, note || `Status changed to ${status} by ${user.full_name || user.email}`]);
  return { ok: true, message: `Status updated to ${status}.`, bookingId: id };
}

export async function cancelBooking(id: string, reason?: string): Promise<BookingFormState> {
  return setBookingStatus(id, "Cancelled", reason || "Booking cancelled.");
}

export async function deleteBooking(id: string): Promise<BookingFormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You must be signed in." };
  if (!(await canDeleteBooking())) return { ok: false, message: "Permission denied: requires Production Manager or Administrator role." };
  
  // The cascade deletes will handle related tables
  const { error } = await db("delete from bookings where id = $1", [id]);
  if (error) return { ok: false, message: error.message };
  
  await db("insert into booking_activity (booking_id, actor_id, action, description) values ($1,$2,'Booking deleted',$3)", [id, user.id, `Booking deleted by ${user.full_name || user.email}`]);
  return { ok: true, message: "Booking deleted permanently." };
}
