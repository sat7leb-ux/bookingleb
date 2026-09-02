import "server-only";
import { db } from "./db";
import type {
  Booking,
  Person,
  Program,
  Channel,
  Location,
  BookingActivity,
  WhatsappMessage,
  OrgSettings,
  Profile,
} from "./types";

export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[safe] caught query error", error);
    }
    return fallback;
  }
}

type JoinedBooking = Booking & {
  person: { id: string; full_name: string; whatsapp: string | null; email: string | null } | null;
  program: { id: string; name: string } | null;
  channel: { id: string; name: string } | null;
  location: { id: string; name: string } | null;
  transportation: { type: string } | null;
  dress_code: { code: string } | null;
};

interface BookingRow extends Booking {
  person_id: string | null;
  program_id: string | null;
  channel_id: string | null;
  location_id: string | null;
}

function hydrateBooking(r: any): JoinedBooking {
  // Neon returns PostgreSQL DATE values as Date objects. Client views compare
  // these values to YYYY-MM-DD keys, so normalize once at the server boundary.
  const productionDate = r.production_date instanceof Date
    ? r.production_date.toISOString().slice(0, 10)
    : r.production_date;
  return {
    ...r,
    production_date: productionDate,
    person: r.person_full_name ? { id: r.person_id, full_name: r.person_full_name, whatsapp: r.person_whatsapp, email: r.person_email } : null,
    program: r.program_name ? { id: r.program_id, name: r.program_name } : null,
    channel: r.channel_name ? { id: r.channel_id, name: r.channel_name } : null,
    location: r.location_name ? { id: r.location_id, name: r.location_name } : null,
    transportation: r.transportation_type ? { type: r.transportation_type } : null,
    dress_code: r.dress_code ? { code: r.dress_code } : null,
  };
}

// cache-bust getBookingById (force rebuild)
export async function getBookings(opts: {
  search?: string;
  status?: string;
  liveRecorded?: string;
  programId?: string;
  channelId?: string;
  personId?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ rows: JoinedBooking[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (clause: string, val: unknown) => {
    params.push(val);
    where.push(clause.replace("?", `$${params.length}`));
  };
  if (opts.status && opts.status !== "all") add("b.confirmation_status = ?", opts.status);
  if (opts.liveRecorded && opts.liveRecorded !== "all") add("b.live_recorded = ?", opts.liveRecorded);
  if (opts.programId && opts.programId !== "all") add("b.program_id = ?", opts.programId);
  if (opts.channelId && opts.channelId !== "all") add("b.channel_id = ?", opts.channelId);
  if (opts.personId && opts.personId !== "all") add("b.person_id = ?", opts.personId);
  if (opts.from) add("b.production_date >= ?", opts.from);
  if (opts.to) add("b.production_date <= ?", opts.to);
  if (opts.search) {
    params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    where.push(
      `(b.booking_number ilike $${params.length - 2} or p.full_name ilike $${params.length - 1} or pr.name ilike $${params.length})`,
    );
  }
  const w = where.length ? `where ${where.join(" and ")}` : "";

  const [field, dir] = (opts.sort ?? "production_date.desc").split(".");
  const orderField: Record<string, string> = {
    production_date: "b.production_date",
    booking_number: "b.booking_number",
    call_time: "b.call_time",
    confirmation_status: "b.confirmation_status",
  };
  const ob = orderField[field] ?? "b.production_date";
  const od = dir === "desc" ? "desc" : "asc";

  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;
  const offset = (page - 1) * pageSize;

  const base = `
    from bookings b
    left join people p on p.id = b.person_id
    left join programs pr on pr.id = b.program_id
    left join channels c on c.id = b.channel_id
    left join locations l on l.id = b.location_id
    left join transportation tr on tr.booking_id = b.id
    left join dress_codes d on d.booking_id = b.id
    ${w}`;

  let total = 0;
  const countResult = await db(`select count(*)::int as n ${base}`, params);
  total = (countResult.rows[0] as any)?.n ?? 0;

  const { rows } = await db<any>(
    `select b.*,
       p.full_name as person_full_name, p.whatsapp as person_whatsapp, p.email as person_email,
       pr.name as program_name,
       c.name as channel_name,
       l.name as location_name,
       tr.type as transportation_type,
       d.code as dress_code,
       (select count(*) from public.booking_guests bg where bg.booking_id = b.id) as guest_count,
       to_char(b.production_date, 'YYYY-MM-DD') as production_date_str
     ${base}
     order by ${ob} ${od}
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, pageSize, offset],
  );
  return { rows: rows.map((r) => hydrateBooking({ ...r, production_date: r.production_date_str })), total };
}

export async function getBookingById(id: string): Promise<{
  booking: JoinedBooking | null;
  guests: { id: string; full_name: string; whatsapp: string | null; email: string | null; role: string | null }[];
  requirements: any | null;
  transportation: any | null;
  dress: any | null;
  activity: BookingActivity[];
  messages: WhatsappMessage[];
}> {
  const { rows } = await db<any>(
    `select b.*,
       p.full_name as person_full_name, p.whatsapp as person_whatsapp, p.email as person_email,
       pr.name as program_name,
       c.name as channel_name,
       l.name as location_name,
       tr.type as transportation_type,
       d.code as dress_code,
       (select count(*) from public.booking_guests bg where bg.booking_id = b.id) as guest_count,
       to_char(b.production_date, 'YYYY-MM-DD') as production_date_str
     from bookings b
     left join people p on p.id = b.person_id
     left join programs pr on pr.id = b.program_id
     left join channels c on c.id = b.channel_id
     left join locations l on l.id = b.location_id
     left join transportation tr on tr.booking_id = b.id
     left join dress_codes d on d.booking_id = b.id
     where b.id = $1`,
    [id],
  );
  const booking = rows[0] ? hydrateBooking({ ...rows[0], production_date: rows[0].production_date_str }) : null;
  const { rows: req } = await db("select * from production_requirements where booking_id = $1", [id]);
  const { rows: transp } = await db("select * from transportation where booking_id = $1", [id]);
  const { rows: dress } = await db("select * from dress_codes where booking_id = $1", [id]);
  const { rows: activity } = await db<BookingActivity & { actor_full_name: string | null; actor_email: string | null }>(
    `select a.*, p.full_name as actor_full_name, p.email as actor_email
     from booking_activity a left join profiles p on p.id = a.actor_id
     where a.booking_id = $1 order by a.created_at desc`,
    [id],
  );
  const { rows: messages } = await db<WhatsappMessage>("select * from whatsapp_messages where booking_id = $1 order by created_at desc", [id]);
  const { rows: guests } = await db<any>(
    `select p.id, p.full_name, p.whatsapp, p.email, bg.role
     from booking_guests bg join people p on p.id = bg.person_id
     where bg.booking_id = $1 order by bg.created_at asc`,
    [id],
  );
  return {
    booking,
    guests: guests.map((g: any) => ({ id: g.id, full_name: g.full_name, whatsapp: g.whatsapp, email: g.email, role: g.role })),
    requirements: req[0] ?? null,
    transportation: transp[0] ?? null,
    dress: dress[0] ?? null,
    activity: activity.map((a) => ({ ...a, actor: a.actor_full_name ? { id: a.actor_id!, full_name: a.actor_full_name, email: a.actor_email! } : null })),
    messages,
  };
}

export async function getLookupData(): Promise<{
  people: Person[];
  programs: Program[];
  channels: Channel[];
  locations: Location[];
}> {
  const [people, programs, channels, locations] = await Promise.all([
    db<Person>("select * from people where active = true order by full_name"),
    db<Program & { channel_name?: string }>("select p.*, c.name as channel_name from programs p left join channels c on c.id = p.channel_id where p.active = true order by p.name"),
    db<Channel>("select * from channels where active = true order by name"),
    db<Location>("select * from locations where active = true order by name"),
  ]);
  return {
    people: people.rows,
    programs: programs.rows as Program[],
    channels: channels.rows,
    locations: locations.rows,
  };
}

export async function getPeopleWithStats(): Promise<Person[]> {
  const { rows } = await db<Person & { total_bookings: number; last_booking: string | null }>(
    `select p.*,
       (select count(*)::int from bookings b where b.person_id = p.id) as total_bookings,
       (select max(production_date) from bookings b where b.person_id = p.id) as last_booking
     from people p order by p.full_name`,
  );
  return rows as Person[];
}

export async function getPrograms(): Promise<Program[]> {
  const { rows } = await db<Program & { channel_name?: string }>(
    "select p.*, c.name as channel_name from programs p left join channels c on c.id = p.channel_id order by p.name",
  );
  return rows as Program[];
}

export async function getChannels(): Promise<Channel[]> {
  const { rows } = await db<Channel>("select * from channels order by name");
  return rows;
}

export async function getLocations(): Promise<Location[]> {
  const { rows } = await db<Location>("select * from locations order by name");
  return rows;
}

export async function getProfiles(): Promise<Profile[]> {
  const { rows } = await db<Profile>("select * from profiles order by full_name");
  return rows;
}

export async function getOrgSettings(): Promise<OrgSettings | null> {
  const { rows } = await db<OrgSettings>("select * from org_settings limit 1");
  return rows[0] ?? null;
}

export async function getDashboardStats(): Promise<{
  total: number;
  today: number;
  upcoming: number;
  pending: number;
  confirmed: number;
  reschedule: number;
  cancelled: number;
  byStatus: { status: string; count: number }[];
  byChannel: { name: string; count: number }[];
  liveVsRecorded: { type: string; count: number }[];
  recent: JoinedBooking[];
  timeline: BookingActivity[];
}> {
  const { rows: all } = await db<any>("select b.confirmation_status, b.production_date, b.live_recorded, c.name as channel_name from bookings b left join channels c on c.id = b.channel_id");
  const today = new Date().toISOString().slice(0, 10);
  const count = (s: string) => all.filter((r) => r.confirmation_status === s).length;
  const byStatus = ["Pending Confirmation", "Confirmed", "Declined", "Reschedule Requested", "Cancelled"].map((status) => ({ status, count: count(status) }));
  const byChannelMap = new Map<string, number>();
  all.forEach((r) => { const n = r.channel_name || "Unknown"; byChannelMap.set(n, (byChannelMap.get(n) ?? 0) + 1); });
  const byChannel = [...byChannelMap.entries()].map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count);
  const live = all.filter((r) => r.live_recorded === "Live").length;
  const recorded = all.filter((r) => r.live_recorded === "Recorded").length;

  const { rows: recent } = await db<any>(
    `select b.*, p.full_name as person_full_name, pr.name as program_name, c.name as channel_name, l.name as location_name
     from bookings b
     left join people p on p.id = b.person_id left join programs pr on pr.id = b.program_id
     left join channels c on c.id = b.channel_id left join locations l on l.id = b.location_id
     order by b.production_date asc limit 8`,
  );
  const { rows: timeline } = await db<BookingActivity & { actor_full_name: string | null; actor_email: string | null }>(
    `select a.*, p.full_name as actor_full_name, p.email as actor_email
     from booking_activity a left join profiles p on p.id = a.actor_id
     order by a.created_at desc limit 8`,
  );

  return {
    total: all.length,
    today: all.filter((r) => r.production_date === today).length,
    upcoming: all.filter((r) => r.production_date && r.production_date >= today).length,
    pending: count("Pending Confirmation"),
    confirmed: count("Confirmed"),
    reschedule: count("Reschedule Requested"),
    cancelled: count("Cancelled"),
    byStatus,
    byChannel,
    liveVsRecorded: [{ type: "Live", count: live }, { type: "Recorded", count: recorded }],
    recent: recent.map(hydrateBooking),
    timeline: timeline.map((a) => ({ ...a, actor: a.actor_full_name ? { id: a.actor_id!, full_name: a.actor_full_name, email: a.actor_email! } : null })),
  };
}
