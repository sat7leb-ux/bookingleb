"use client";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/utils";

export function BookingWhatsAppButton({ booking }: { booking: any }) {
  const person = booking.person;
  const name = person?.full_name ?? "";
  const phone = person?.whatsapp ?? "";
  const link = waLink(phone, "");
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
