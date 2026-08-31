import { formatDate } from "@/lib/utils";
import type { Booking } from "@/lib/types";

/**
 * Build a formatted WhatsApp confirmation message. We do NOT claim delivery —
 * the deep link only opens WhatsApp with the pre-filled text. The status stays
 * "prepared" until the user actually sends it in WhatsApp.
 */
export function buildWhatsappMessage(b: Booking & {
  person?: { full_name: string; whatsapp?: string | null } | null;
  program?: { name: string } | null;
  channel?: { name: string } | null;
  location?: { name: string } | null;
  requirements?: any;
  transportation?: any;
  dress?: any;
}): string {
  const lines: string[] = [];
  lines.push(`*📺 Production Booking Confirmation*`);
  lines.push(`────────────────────────`);
  lines.push(`*Booking ID:* ${b.booking_number}`);
  lines.push(`*Guest:* ${b.person?.full_name ?? "—"}`);
  lines.push(`*Program:* ${b.program?.name ?? "—"}`);
  lines.push(`*Channel:* ${b.channel?.name ?? "—"}`);
  lines.push(`*Date:* ${formatDate(b.production_date)}`);
  lines.push(`*Call Time:* ${b.call_time ?? "—"}`);
  lines.push(`*Start:* ${b.start_time ?? "—"}  *End:* ${b.end_time ?? "—"}`);
  lines.push(`*Live/Recorded:* ${b.live_recorded}`);
  if (b.episode_number) lines.push(`*Episode:* ${b.episode_number}`);
  lines.push(`*Location:* ${b.location?.name ?? "—"}`);
  if (b.requirements) {
    lines.push(``);
    lines.push(`*Production Requirements:*`);
    if (b.requirements.place_in) lines.push(`• Place-In: ${b.requirements.place_in} @ ${b.requirements.place_in_time ?? "—"} (${b.requirements.place_in_location ?? "—"})`);
    if (b.requirements.top_camera) lines.push(`• Top Camera: ${b.requirements.top_camera} @ ${b.requirements.top_camera_time ?? "—"} (${b.requirements.top_camera_location ?? "—"})`);
  }
  if (b.transportation) {
    lines.push(``);
    lines.push(`*Transportation:* ${b.transportation.type}`);
    if (b.transportation.departure_time) lines.push(`• Departure: ${b.transportation.departure_time}`);
    if (b.transportation.pickup_location) lines.push(`• Pickup: ${b.transportation.pickup_location}`);
    if (b.transportation.driver) lines.push(`• Driver: ${b.transportation.driver}`);
  }
  if (b.dress) {
    lines.push(``);
    lines.push(`*Dress Code:* ${b.dress.code}`);
    if (b.dress.notes) lines.push(`• ${b.dress.notes}`);
  }
  if (b.extra_notes) {
    lines.push(``);
    lines.push(`*Notes:* ${b.extra_notes}`);
  }
  lines.push(``);
  lines.push(`_Please confirm by replying. Thank you!_`);
  return lines.join("\n");
}
