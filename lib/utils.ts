import type {
  Role,
  ConfirmationStatus,
  LiveRecorded,
  TransportationType,
  DressCode,
} from "./types";

// ---- Option lists (mirrored in SQL CHECK constraints) ----
// To extend: update the union in lib/types.ts AND the matching CHECK in migrations.

export const ROLES: Role[] = [
  "Administrator",
  "Production Manager",
  "Production User",
  "Viewer",
];

export const CONFIRMATION_STATUSES: ConfirmationStatus[] = [
  "Pending Confirmation",
  "Confirmed",
  "Declined",
  "Reschedule Requested",
  "Cancelled",
];

export const LIVE_RECORDED: LiveRecorded[] = ["Live", "Recorded"];

export const TRANSPORTATION_TYPES: TransportationType[] = [
  "Bus",
  "Car",
  "Van",
  "OB Van",
  "Own Transportation",
  "Other",
];

export const DRESS_CODES: DressCode[] = [
  "Formal",
  "Business Casual",
  "Casual",
  "TV Appropriate",
  "Traditional",
  "Other",
];

// ---- Visual tokens per status / type ----
export const STATUS_STYLES: Record<
  ConfirmationStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  "Pending Confirmation": {
    dot: "bg-warning",
    bg: "bg-warning/12",
    text: "text-warning",
    label: "Pending",
  },
  Confirmed: {
    dot: "bg-success",
    bg: "bg-success/12",
    text: "text-success",
    label: "Confirmed",
  },
  Declined: {
    dot: "bg-danger",
    bg: "bg-danger/12",
    text: "text-danger",
    label: "Declined",
  },
  "Reschedule Requested": {
    dot: "bg-violet",
    bg: "bg-violet/12",
    text: "text-violet",
    label: "Reschedule",
  },
  Cancelled: {
    dot: "bg-muted-2",
    bg: "bg-muted-2/12",
    text: "text-muted",
    label: "Cancelled",
  },
};

export const TRANSPORT_ICON: Record<TransportationType, string> = {
  Bus: "🚌",
  Car: "🚗",
  Van: "🚐",
  "OB Van": "📡",
  "Own Transportation": "🚶",
  Other: "🛻",
};

// Status colors for the calendar (hex, for inline style)
export const STATUS_HEX: Record<ConfirmationStatus, string> = {
  "Pending Confirmation": "#f5a623",
  Confirmed: "#34d399",
  Declined: "#f87171",
  "Reschedule Requested": "#a78bfa",
  Cancelled: "#6b7280",
};

export const DEFAULT_BOOKING_PREFIX = "SAT7";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(
  iso: string | Date | null | undefined,
  fmt: string = "MMM d, yyyy",
): string {
  if (!iso) return "—";
  const isoStr = iso instanceof Date ? iso.toISOString() : iso;
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "—";
  const map: Record<string, string> = {
    "MMM d, yyyy": d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    "yyyy-MM-dd": isoStr.slice(0, 10),
    "MMM d": d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    "EEEE, MMM d": d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
  };
  return map[fmt] ?? isoStr.slice(0, 10);
}

export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const s = iso instanceof Date ? iso.toTimeString().slice(0, 5) : iso;
  // times are stored as HH:mm strings
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function timeAgo(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso instanceof Date ? iso.toISOString() : iso).getTime();
  const diff = Date.now() - d;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

// Phone -> WhatsApp deep link (wa.me expects digits only, no +)
export function waLink(phone: string | null | undefined, text: string): string {
  if (!phone) return "#";
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
