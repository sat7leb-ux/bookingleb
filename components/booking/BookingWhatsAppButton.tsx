"use client";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/utils";
import { buildWhatsappMessage } from "@/lib/whatsapp";

export function BookingWhatsAppButton({ booking }: { booking: any }) {
  const person = booking.person;
  const phone = person?.whatsapp ?? "";
  if (!phone) return null;
  const text = buildWhatsappMessage({
    ...booking,
    person: person ? { full_name: person.full_name, whatsapp: phone } : null,
    program: booking.program ? { name: booking.program.name } : null,
    channel: booking.channel ? { name: booking.channel.name } : null,
    location: booking.location ? { name: booking.location.name } : null,
    requirements: booking.requirements,
    transportation: booking.transportation,
    dress: booking.dress,
    confirmation_status: booking.confirmation_status,
  });
  const link = waLink(phone, text);
  if (link === "#") return null;
  return (
    <button
      onClick={() => window.open(link, "_blank")}
      className="rounded-md p-1.5 text-muted-2 hover:bg-surface-2 hover:text-primary"
      aria-label="Send WhatsApp"
      title="Send WhatsApp"
    >
      <MessageCircle size={16} />
    </button>
  );
}
