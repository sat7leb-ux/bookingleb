import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBookingById } from "@/lib/queries";
import { db } from "@/lib/db";
import { safe } from "@/lib/queries";
import { BookingDetailClient } from "@/components/booking/BookingDetailClient";
import { EmptyState } from "@/components/ui/Card";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const data = await safe(() => getBookingById(params.id), null);
  if (!data || !data.booking) {
    const probe = await db("select id, booking_number from bookings where id = $1", [params.id]);
    return (
      <div className="space-y-3 p-6">
        <h1 className="text-xl font-bold text-red-500">BOOKING NOT FOUND (debug)</h1>
        <p>params.id = {params.id}</p>
        <p>getBookingById returned booking: {data && data.booking ? "yes" : "null"}</p>
        <p>probe rows: {probe.rows.length} error: {probe.error ? probe.error.message : "none"}</p>
        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

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
