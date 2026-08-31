import "server-only";
import { createCookieClient } from "./supabase/server";
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

/**
 * Wrap any query so that an unconfigured / unavailable Supabase degrades to a
 * safe empty result instead of throwing a 500. The UI shows honest states.
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
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
  const sb = createCookieClient();
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;

  let query = sb
    .from("bookings")
    .select(
      `*, person:people(id, full_name, whatsapp, email), program:programs(id, name), channel:channels(id, name), location:locations(id, name), transportation:transportation(type), dress_code:dress_codes(code)`,
      { count: "exact" },
    );

  if (opts.status && opts.status !== "all") query = query.eq("confirmation_status", opts.status);
  if (opts.liveRecorded && opts.liveRecorded !== "all")
    query = query.eq("live_recorded", opts.liveRecorded);
  if (opts.programId && opts.programId !== "all") query = query.eq("program_id", opts.programId);
  if (opts.channelId && opts.channelId !== "all") query = query.eq("channel_id", opts.channelId);
  if (opts.personId && opts.personId !== "all") query = query.eq("person_id", opts.personId);
  if (opts.from) query = query.gte("production_date", opts.from);
  if (opts.to) query = query.lte("production_date", opts.to);
  if (opts.search) {
    query = query.or(
      `booking_number.ilike.%${opts.search}%,person.full_name.ilike.%${opts.search}%,program.name.ilike.%${opts.search}%`,
    );
  }

  const sort = opts.sort ?? "production_date.desc";
  const [field, dir] = sort.split(".");
  query = query.order(field, { ascending: dir !== "desc" });

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data as JoinedBooking[]) ?? [], total: count ?? 0 };
}

export async function getBookingById(id: string): Promise<{
  booking: JoinedBooking | null;
  requirements: any | null;
  transportation: any | null;
  dress: any | null;
  activity: BookingActivity[];
  messages: WhatsappMessage[];
}> {
  const sb = createCookieClient();
  const { data: booking } = await sb
    .from("bookings")
    .select(
      `*, person:people(id, full_name, whatsapp, email), program:programs(id, name), channel:channels(id, name), location:locations(id, name)`,
    )
    .eq("id", id)
    .maybeSingle();
  const { data: requirements } = await sb
    .from("production_requirements")
    .select("*")
    .eq("booking_id", id)
    .maybeSingle();
  const { data: transportation } = await sb
    .from("transportation")
    .select("*")
    .eq("booking_id", id)
    .maybeSingle();
  const { data: dress } = await sb
    .from("dress_codes")
    .select("*")
    .eq("booking_id", id)
    .maybeSingle();
  const { data: activity } = await sb
    .from("booking_activity")
    .select(`*, actor:profiles(id, full_name, email)`)
    .eq("booking_id", id)
    .order("created_at", { ascending: false });
  const { data: messages } = await sb
    .from("whatsapp_messages")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });
  return {
    booking: (booking as JoinedBooking) ?? null,
    requirements,
    transportation,
    dress,
    activity: (activity as BookingActivity[]) ?? [],
    messages: (messages as WhatsappMessage[]) ?? [],
  };
}

export async function getLookupData(): Promise<{
  people: Person[];
  programs: Program[];
  channels: Channel[];
  locations: Location[];
}> {
  const sb = createCookieClient();
  const [people, programs, channels, locations] = await Promise.all([
    sb.from("people").select("*").eq("active", true).order("full_name"),
    sb.from("programs").select("*, channel:channels(name)").eq("active", true).order("name"),
    sb.from("channels").select("*").eq("active", true).order("name"),
    sb.from("locations").select("*").eq("active", true).order("name"),
  ]);
  return {
    people: (people.data as Person[]) ?? [],
    programs: (programs.data as Program[]) ?? [],
    channels: (channels.data as Channel[]) ?? [],
    locations: (locations.data as Location[]) ?? [],
  };
}

export async function getPeopleWithStats(): Promise<Person[]> {
  const sb = createCookieClient();
  const { data } = await sb
    .from("people")
    .select(
      `*, bookings:bookings(count), last:bookings(production_date)`,
    )
    .order("full_name");
  const rows = (data as any[]) ?? [];
  return rows.map((r) => ({
    ...r,
    total_bookings: r.bookings?.[0]?.count ?? 0,
    last_booking: Array.isArray(r.last)
      ? r.last.map((b: any) => b.production_date).filter(Boolean).sort().reverse()[0] ?? null
      : null,
  })) as Person[];
}

export async function getPrograms(): Promise<Program[]> {
  const sb = createCookieClient();
  const { data } = await sb
    .from("programs")
    .select("*, channel:channels(name)")
    .order("name");
  return (data as Program[]) ?? [];
}

export async function getChannels(): Promise<Channel[]> {
  const sb = createCookieClient();
  const { data } = await sb.from("channels").select("*").order("name");
  return (data as Channel[]) ?? [];
}

export async function getProfiles(): Promise<Profile[]> {
  const sb = createCookieClient();
  const { data } = await sb.from("profiles").select("*").order("full_name");
  return (data as Profile[]) ?? [];
}

export async function getLocations(): Promise<Location[]> {
  const sb = createCookieClient();
  const { data } = await sb.from("locations").select("*").order("name");
  return (data as Location[]) ?? [];
}

export async function getOrgSettings(): Promise<OrgSettings | null> {
  const sb = createCookieClient();
  const { data } = await sb
    .from("org_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  return (data as OrgSettings) ?? null;
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
  const sb = createCookieClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: all }, { data: recent }, { data: timeline }] = await Promise.all([
    sb.from("bookings").select("confirmation_status, production_date, channel:channels(name), live_recorded"),
    sb
      .from("bookings")
      .select(
        `*, person:people(id, full_name, whatsapp, email), program:programs(id, name), channel:channels(id, name), location:locations(id, name)`,
      )
      .order("production_date", { ascending: true })
      .limit(8),
    sb
      .from("booking_activity")
      .select(`*, actor:profiles(id, full_name, email)`)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rows = (all as any[]) ?? [];
  const count = (s: string) => rows.filter((r) => r.confirmation_status === s).length;
  const byStatus = [
    "Pending Confirmation",
    "Confirmed",
    "Declined",
    "Reschedule Requested",
    "Cancelled",
  ].map((status) => ({ status, count: count(status) }));
  const byChannelMap = new Map<string, number>();
  rows.forEach((r) => {
    const name = r.channel?.name || "Unknown";
    byChannelMap.set(name, (byChannelMap.get(name) ?? 0) + 1);
  });
  const byChannel = [...byChannelMap.entries()]
    .map(([name, c]) => ({ name, count: c }))
    .sort((a, b) => b.count - a.count);
  const live = rows.filter((r) => r.live_recorded === "Live").length;
  const recorded = rows.filter((r) => r.live_recorded === "Recorded").length;

  return {
    total: rows.length,
    today: rows.filter((r) => r.production_date === today).length,
    upcoming: rows.filter((r) => r.production_date && r.production_date >= today).length,
    pending: count("Pending Confirmation"),
    confirmed: count("Confirmed"),
    reschedule: count("Reschedule Requested"),
    cancelled: count("Cancelled"),
    byStatus,
    byChannel,
    liveVsRecorded: [
      { type: "Live", count: live },
      { type: "Recorded", count: recorded },
    ],
    recent: (recent as JoinedBooking[]) ?? [],
    timeline: (timeline as BookingActivity[]) ?? [],
  };
}
