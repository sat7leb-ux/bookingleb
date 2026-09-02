// Domain types — mirror the Supabase schema in supabase/migrations.

export type Role = "Administrator" | "Production Manager" | "Production User" | "Viewer" | "Guest";

export type ConfirmationStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "Declined"
  | "Reschedule Requested"
  | "Cancelled";

export type LiveRecorded = "Live" | "Recorded";

export type TransportationType =
  | "Bus"
  | "Car"
  | "Van"
  | "OB Van"
  | "Own Transportation"
  | "Other";

export type DressCode =
  | "Formal"
  | "Business Casual"
  | "Casual"
  | "TV Appropriate"
  | "Traditional"
  | "Other";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  whatsapp: string | null;
  email: string | null;
  department: string | null;
  company: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  // computed
  total_bookings?: number;
  last_booking?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string | null;
  active: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  channel_id: string | null;
  company: string | null;
  default_location: string | null;
  default_place_in: string | null;
  default_top_camera: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  channel_name?: string | null;
}

export interface ProductionRequirement {
  id: string;
  booking_id: string;
  place_in: string | null;
  place_in_time: string | null;
  place_in_location: string | null;
  place_in_notes: string | null;
  top_camera: string | null;
  top_camera_time: string | null;
  top_camera_location: string | null;
  top_camera_notes: string | null;
}

export interface Transportation {
  id: string;
  booking_id: string;
  type: TransportationType;
  departure_time: string | null;
  pickup_location: string | null;
  driver: string | null;
  notes: string | null;
}

export interface DressCodeRow {
  id: string;
  booking_id: string;
  code: DressCode;
  notes: string | null;
}

export interface Booking {
  id: string;
  booking_number: string;
  person_id: string | null;
  program_id: string | null;
  channel_id: string | null;
  production_date: string | null;
  call_time: string | null;
  start_time: string | null;
  end_time: string | null;
  live_recorded: LiveRecorded;
  episode_number: string | null;
  recorded_episodes_count: number | null;
  location_id: string | null;
  location_ids: string[];
  extra_notes: string | null;
  confirmation_status: ConfirmationStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  person?: Pick<Person, "id" | "full_name" | "whatsapp" | "email"> | null;
  program?: Pick<Program, "id" | "name"> | null;
  channel?: Pick<Channel, "id" | "name"> | null;
  location?: Pick<Location, "id" | "name"> | null;
  locations?: Pick<Location, "id" | "name">[];
}

export interface BookingActivity {
  id: string;
  booking_id: string;
  actor_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export interface WhatsappMessage {
  id: string;
  booking_id: string;
  recipient: string | null;
  message: string;
  channel: string | null;
  status: "prepared" | "sent" | "delivered" | "failed";
  created_by: string | null;
  created_at: string;
}

export interface OrgSettings {
  id: string;
  org_name: string;
  booking_prefix: string;
  time_zone: string;
  date_format: string;
  default_booking_duration: number;
}
