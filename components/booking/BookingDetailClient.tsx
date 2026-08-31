"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Pencil,
  Copy,
  XCircle,
  Printer,
  MessageCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { CONFIRMATION_STATUSES, waLink, formatDate, formatTime, timeAgo } from "@/lib/utils";
import { setBookingStatus, cancelBooking, duplicateBooking } from "@/services/bookings";
import { recordWhatsapp } from "@/services/crud";

export function BookingDetailClient({ booking, requirements, transportation, dress, messages, activity, guests }: {
  booking: any;
  requirements: any;
  transportation: any;
  dress: any;
  messages: any[];
  activity: any[];
  guests?: { id: string; full_name: string; whatsapp: string | null; email: string | null; role: string | null }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [waOpen, setWaOpen] = useState(false);
  const [waText, setWaText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);

  function buildMessage() {
    const b = { ...booking, requirements, transportation, dress };
    const lines = [
      `*📺 Production Booking Confirmation*`,
      `────────────────────────`,
      `*Booking ID:* ${b.booking_number}`,
      `*Guest:* ${b.person?.full_name ?? "—"}`,
      `*Program:* ${b.program?.name ?? "—"}`,
      `*Channel:* ${b.channel?.name ?? "—"}`,
      `*Date:* ${formatDate(b.production_date)}`,
      `*Call Time:* ${b.call_time ?? "—"}`,
      `*Start:* ${b.start_time ?? "—"}  *End:* ${b.end_time ?? "—"}`,
      `*Live/Recorded:* ${b.live_recorded}`,
      b.episode_number ? `*Episode:* ${b.episode_number}` : "",
      `*Location:* ${b.location?.name ?? "—"}`,
      requirements?.place_in ? `*Place-In:* ${requirements.place_in} @ ${requirements.place_in_time ?? "—"}` : "",
      requirements?.top_camera ? `*Top Camera:* ${requirements.top_camera} @ ${requirements.top_camera_time ?? "—"}` : "",
      transportation ? `*Transportation:* ${transportation.type}` : "",
      dress ? `*Dress Code:* ${dress.code}` : "",
      b.extra_notes ? `*Notes:* ${b.extra_notes}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }

  async function openWhatsApp() {
    const text = buildMessage();
    setWaText(text);
    // record as prepared (honest: not delivered)
    setProcessing(true);
    const res = await recordWhatsapp(
      booking.id,
      booking.person?.whatsapp ?? "",
      text,
      booking.channel?.name ?? "",
    );
    setProcessing(false);
    if (!res.ok) {
      toast("error", res.message);
      return;
    }
    const link = waLink(booking.person?.whatsapp, text);
    if (link === "#") {
      toast("warning", "No WhatsApp number on file for this guest.");
      return;
    }
    // open WhatsApp — we do NOT claim delivery
    window.open(link, "_blank");
    toast("info", "WhatsApp opened. Delivery is confirmed by the guest, not the system.");
    router.refresh();
  }

  async function changeStatus(s: any) {
    setProcessing(true);
    const res = await setBookingStatus(booking.id, s);
    setProcessing(false);
    if (!res.ok) toast("error", res.message);
    else {
      toast("success", res.message);
      router.refresh();
    }
  }

  async function doCancel() {
    setProcessing(true);
    const res = await cancelBooking(booking.id);
    setProcessing(false);
    if (!res.ok) toast("error", res.message);
    else { toast("success", res.message); router.refresh(); }
  }

  async function doDuplicate() {
    setProcessing(true);
    const res = await duplicateBooking(booking.id);
    setProcessing(false);
    if (!res.ok) toast("error", res.message);
    else { toast("success", res.message); router.push(`/bookings/${res.bookingId}`); router.refresh(); }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <StatusBadge status={booking.confirmation_status} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => window.print()}><Printer size={15} /> Print</Button>
          <Button variant="soft" onClick={openWhatsApp} disabled={processing}><MessageCircle size={15} /> WhatsApp</Button>
          <Button variant="ghost" onClick={() => router.push(`/bookings/${booking.id}/edit`)}><Pencil size={15} /> Edit</Button>
          <Button variant="ghost" onClick={() => setDupOpen(true)}><Copy size={15} /> Duplicate</Button>
          {booking.confirmation_status !== "Cancelled" && (
            <Button variant="danger" onClick={() => setConfirmCancel(true)}><XCircle size={15} /> Cancel</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-2">
        <Section title="Booking Overview">
          <Row k="Booking ID" v={<span className="font-mono text-xs">{booking.booking_number}</span>} />
          <Row k="Live / Recorded" v={booking.live_recorded} />
          <Row k="Episode" v={booking.episode_number ?? "—"} />
          <Row k="Status" v={<StatusBadge status={booking.confirmation_status} />} />
          <div className="mt-3 flex flex-wrap gap-2">
            {CONFIRMATION_STATUSES.filter((s) => s !== booking.confirmation_status && s !== "Cancelled").map((s) => (
              <button key={s} disabled={processing} onClick={() => changeStatus(s)} className="btn-soft text-xs">
                Mark {s}
              </button>
            ))}
            {booking.confirmation_status !== "Cancelled" && (
              <button disabled={processing} onClick={() => changeStatus("Cancelled")} className="btn-danger text-xs">Cancel</button>
            )}
          </div>
        </Section>

        <Section title={guests && guests.length > 1 ? `Guests (${guests.length})` : "Guest Information"}>
          {guests && guests.length > 0 ? (
            <div className="space-y-2">
              {guests.map((g, i) => (
                <div key={g.id} className="rounded-lg border border-border bg-surface-2/40 px-3 py-2 text-sm">
                  <div className="font-medium text-fg">{g.full_name}{i === 0 ? " · Primary" : ""}</div>
                  <div className="text-xs text-muted">{[g.whatsapp, g.email].filter(Boolean).join(" · ") || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Row k="Name" v={booking.person?.full_name ?? "—"} />
              <Row k="WhatsApp" v={booking.person?.whatsapp ?? "—"} />
              <Row k="Email" v={booking.person?.email ?? "—"} />
            </>
          )}
        </Section>

        <Section title="Program Information">
          <Row k="Program" v={booking.program?.name ?? "—"} />
          <Row k="Channel" v={booking.channel?.name ?? "—"} />
          <Row k="Episode" v={booking.episode_number ?? "—"} />
        </Section>

        <Section title="Production Schedule">
          <Row k="Date" v={formatDate(booking.production_date)} />
          <Row k="Call Time" v={formatTime(booking.call_time)} />
          <Row k="Start" v={formatTime(booking.start_time)} />
          <Row k="End" v={formatTime(booking.end_time)} />
          <Row k="Location" v={booking.location?.name ?? "—"} />
        </Section>

        <Section title="Production Requirements">
          {requirements?.place_in || requirements?.top_camera ? (
            <>
              {requirements?.place_in && <Row k="Place-In" v={`${requirements.place_in} @ ${formatTime(requirements.place_in_time)} · ${requirements.place_in_location ?? "—"}`} />}
              {requirements?.top_camera && <Row k="Top Camera" v={`${requirements.top_camera} @ ${formatTime(requirements.top_camera_time)} · ${requirements.top_camera_location ?? "—"}`} />}
              {requirements?.place_in_notes && <Row k="Notes" v={requirements.place_in_notes} />}
            </>
          ) : (
            <p className="text-sm text-muted">No requirements specified.</p>
          )}
        </Section>

        <Section title="Transportation">
          {transportation ? (
            <>
              <Row k="Type" v={transportation.type} />
              <Row k="Departure" v={formatTime(transportation.departure_time)} />
              <Row k="Pickup" v={transportation.pickup_location ?? "—"} />
              <Row k="Driver" v={transportation.driver ?? "—"} />
              {transportation.notes && <Row k="Notes" v={transportation.notes} />}
            </>
          ) : (
            <p className="text-sm text-muted">No transportation.</p>
          )}
        </Section>

        <Section title="Dress Code">
          {dress ? (
            <>
              <Row k="Code" v={dress.code} />
              {dress.notes && <Row k="Notes" v={dress.notes} />}
            </>
          ) : (
            <p className="text-sm text-muted">Not specified.</p>
          )}
        </Section>

        <Section title="Notes">
          <p className="whitespace-pre-wrap text-sm text-fg">{booking.extra_notes || "—"}</p>
        </Section>

        <Section title="Confirmation">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">No messages sent yet.</p>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="rounded-lg bg-surface-2/50 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-fg">{m.channel ?? "WhatsApp"}</span>
                    <span className="text-muted-2">{timeAgo(m.created_at)}</span>
                  </div>
                  <p className="text-muted">Status: {m.status} (not delivery-confirmed)</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Activity Timeline">
          <ActivityList activity={activity ?? []} />
        </Section>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={doCancel}
        title="Cancel this booking?"
        message="This marks the booking as Cancelled and logs the event. It can be reopened later by changing status."
        confirmLabel="Cancel Booking"
      />
      <ConfirmDialog
        open={dupOpen}
        onClose={() => setDupOpen(false)}
        onConfirm={doDuplicate}
        title="Duplicate booking?"
        message="Creates a new pending booking copying all details. You can then edit the date."
        confirmLabel="Duplicate"
        danger={false}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 text-sm last:border-0">
      <span className="shrink-0 text-muted">{k}</span>
      <span className="text-right font-medium text-fg">{v}</span>
    </div>
  );
}

function ActivityList({ activity }: { activity: any[] }) {
  if (activity.length === 0) return <p className="text-sm text-muted">No activity yet.</p>;
  return (
    <div className="space-y-3">
      {activity.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
          <div className="min-w-0">
            <p className="text-sm text-fg">{a.action}</p>
            {a.description && <p className="text-xs text-muted">{a.description}</p>}
            <p className="text-xs text-muted-2">{timeAgo(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
