import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBookingById } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { BookingDetailClient } from "@/components/booking/BookingDetailClient";
import { EmptyState } from "@/components/ui/Card";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const data = await safe(() => getBookingById(params.id), null);
  if (!data || !data.booking) notFound();

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <Link href="/bookings" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft size={15} /> Back to bookings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-fg">{data.booking.person?.full_name ?? "Booking"}</h1>
        <p className="font-mono text-xs text-muted">{data.booking.booking_number}</p>
      </div>

      <BookingDetailClient
        booking={data.booking}
        requirements={data.requirements}
        transportation={data.transportation}
        dress={data.dress}
        messages={data.messages}
        activity={data.activity}
      />
    </div>
  );
}
