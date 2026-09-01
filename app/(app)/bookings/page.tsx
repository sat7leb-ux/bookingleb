import Link from "next/link";
import { Plus } from "lucide-react";
import { getBookings, getLookupData } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusSelect } from "@/components/booking/StatusSelect";
import { Button } from "@/components/ui/Button";
import { BookingsToolbar } from "@/components/booking/BookingsToolbar";
import { canWrite, canChangeStatus } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const canCreate = await canWrite();
  const canChange = await canChangeStatus();
  const lookup = await safe(() => getLookupData(), {
    people: [],
    programs: [],
    channels: [],
    locations: [],
  });

  const { rows, total } = await safe(
    () =>
      getBookings({
        search: searchParams.q,
        status: searchParams.status,
        liveRecorded: searchParams.lr,
        programId: searchParams.program,
        channelId: searchParams.channel,
        personId: searchParams.person,
        from: searchParams.from,
        to: searchParams.to,
        sort: searchParams.sort,
        page: searchParams.page ? Number(searchParams.page) : 1,
      }),
    { rows: [], total: 0 },
  );

  const page = Number(searchParams.page || 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Bookings</h1>
          <p className="mt-1 text-sm text-muted">{total} total · page {page}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Link href="/bookings/new" className="btn-primary">
              <Plus size={16} /> Create Booking
            </Link>
          )}
        </div>
      </div>

      <BookingsToolbar
        channels={lookup.channels}
        programs={lookup.programs}
        people={lookup.people}
        current={searchParams}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted">Booking</th>
                <th className="px-4 py-3 font-medium text-muted">Person</th>
                <th className="px-4 py-3 font-medium text-muted">Program</th>
                <th className="px-4 py-3 font-medium text-muted">Date</th>
                <th className="px-4 py-3 font-medium text-muted">Status</th>
                <th className="px-4 py-3 font-medium text-muted">Channel</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No bookings match your filters.
                  </td>
                </tr>
              )}
              {rows.map((b: any) => (
                <tr key={b.id} className="border-b border-border/60 hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <Link href={`/bookings/${b.id}`} className="font-medium text-accent hover:underline">
                      {b.booking_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-fg">{b.person?.full_name ?? b.guest_name ?? "—"}</div>
                    <div className="text-xs text-muted">{b.person?.organization ?? b.organization ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-fg">{b.program?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{b.production_date ? new Date(b.production_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><StatusSelect bookingId={b.id} current={b.confirmation_status} canChange={canChange} /></td>
                  <td className="px-4 py-3 text-muted">{b.channel?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
