import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  Hourglass,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Radio,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { BarList, Donut, MiniTimeline } from "@/components/ui/Charts";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, timeAgo } from "@/lib/utils";
import { RealtimeBadge } from "@/components/realtime/RealtimeBadge";

const STATUS_HEX: Record<string, string> = {
  "Pending Confirmation": "#f5a623",
  Confirmed: "#34d399",
  Declined: "#f87171",
  "Reschedule Requested": "#a78bfa",
  Cancelled: "#6b7280",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await safe(() => getDashboardStats(), null);
  if (!stats) {
    return (
      <EmptyState
        icon={<Radio size={22} />}
        title="Database not connected"
        description="Set your Supabase environment variables in .env.local to load live production data."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Production Dashboard</h1>
          <p className="page-subtitle">Live overview of all production bookings.</p>
        </div>
        <Link href="/bookings/new" className="btn-primary">
          <Plus size={16} /> Create Booking
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Today" value={stats.today} icon={<CalendarClock size={18} />} accent="info" sub="bookings" href="/bookings?date=today" />
        <StatCard label="Upcoming" value={stats.upcoming} icon={<CalendarDays size={18} />} accent="primary" sub="scheduled" href="/bookings?from=today" />
        <StatCard label="Pending" value={stats.pending} icon={<Hourglass size={18} />} accent="warning" sub="awaiting reply" href="/bookings?status=Pending+Confirmation" />
        <StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 size={18} />} accent="success" sub="locked in" href="/bookings?status=Confirmed" />
        <StatCard label="Reschedule" value={stats.reschedule} icon={<RefreshCw size={18} />} accent="violet" sub="requests" href="/bookings?status=Reschedule+Requested" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={<XCircle size={18} />} accent="danger" sub="this period" href="/bookings?status=Cancelled" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Bookings by Status" subtitle="Distribution across confirmation states" />
          <div className="p-5">
            <BarList
              data={stats.byStatus
                .filter((s) => s.count > 0)
                .map((s) => ({ label: s.status, value: s.count }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Live vs Recorded" />
          <div className="flex items-center justify-center p-5">
            <Donut
              data={[
                { label: "Live", value: stats.liveVsRecorded[0].count, color: "#f87171" },
                { label: "Recorded", value: stats.liveVsRecorded[1].count, color: "#34d399" },
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming Productions"
            action={
              <Link href="/bookings" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {stats.recent.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">No bookings yet.</div>
            )}
            {stats.recent.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {b.person?.full_name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {b.program?.name ?? "—"} · {b.channel?.name ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-fg">{formatDate(b.production_date)}</p>
                  <p className="text-xs text-muted-2">{b.call_time ?? "—"}</p>
                </div>
                <StatusBadge status={b.confirmation_status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" />
          <div className="p-5">
            {stats.timeline.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <MiniTimeline
                items={stats.timeline.map((a) => ({
                  label: a.action,
                  time: timeAgo(a.created_at),
                  color: "rgb(var(--accent))",
                }))}
              />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bookings by Channel" />
        <div className="p-5">
          <BarList
            data={stats.byChannel.map((c) => ({ label: c.name, value: c.count }))}
            color="rgb(var(--accent))"
          />
        </div>
      </Card>
    </div>
  );
}
