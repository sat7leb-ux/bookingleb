import Link from "next/link";
import { Plus, Search, Download } from "lucide-react";
import { getBookings, getLookupData } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { BookingsToolbar } from "@/components/booking/BookingsToolbar";
import { exportBookingsCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
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
  const pageSize = 12;

  // CSV export (all filtered rows, not paginated) — generated server-side
  let csv: string | null = null;
  if (searchParams.export === "csv") {
    const all = await safe(
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
          pageSize: 10000,
        }),
      { rows: [], total: 0 },
    );
    csv = exportBookingsCsv(all.rows);
  }

  if (searchParams.export === "csv" && csv) {
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="bookings.csv"',
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Bookings</h1>
          <p className="mt-1 text-sm text-muted">{total} total · page {page}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/bookings?export=csv${new URLSearchParams(searchParams as Record<string, string>)}`} className="btn-soft">
            <Download size={16} /> Export CSV
          </a>
          <Link href="/bookings/new" className="btn-primary">
            <Plus size={16} /> New Booking
          </Link>
        </div>
      </div>

      <BookingsToolbar
        channels={lookup.channels}
        programs={lookup.programs}
        people={lookup.people}
        current={searchParams}
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-muted">
            No bookings match your filters.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-2">
                    <th className="px-4 py-3 font-medium">Booking ID</th>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Program</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Call</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Transport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Link href={`/bookings/${b.id}`} className="font-mono text-xs text-primary hover:underline">
                          {b.booking_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-fg">{b.person?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-fg">{b.program?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{b.channel?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-fg">{formatDate(b.production_date)}</td>
                      <td className="px-4 py-3 text-muted">{b.call_time ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{b.location?.name ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.confirmation_status} /></td>
                      <td className="px-4 py-3 text-muted">{b.transportation?.type ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {rows.map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}`} className="block px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary">{b.booking_number}</span>
                    <StatusBadge status={b.confirmation_status} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-fg">{b.person?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted">{b.program?.name ?? "—"} · {b.channel?.name ?? "—"}</p>
                  <p className="text-xs text-muted-2">{formatDate(b.production_date)} · {b.call_time ?? "—"}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/bookings?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`} className="btn-soft">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          {page * pageSize < total && (
            <Link href={`/bookings?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`} className="btn-soft">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
