import type { Booking } from "./types";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportBookingsCsv(rows: any[]): string {
  const headers = [
    "Booking Number",
    "Guest",
    "Program",
    "Channel",
    "Date",
    "Call Time",
    "Start",
    "End",
    "Live/Recorded",
    "Episode",
    "Location",
    "Status",
    "Transportation",
    "Dress Code",
  ];
  const lines = [headers.map(csvCell).join(",")];
  for (const b of rows) {
    lines.push(
      [
        b.booking_number,
        b.person?.full_name,
        b.program?.name,
        b.channel?.name,
        b.production_date,
        b.call_time,
        b.start_time,
        b.end_time,
        b.live_recorded,
        b.episode_number,
        b.location?.name,
        b.confirmation_status,
        b.transportation?.type,
        b.dress_code?.code,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}
