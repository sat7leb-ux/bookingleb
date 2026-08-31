import { getBookings } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EmptyState } from "@/components/ui/Card";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { rows } = await safe(
    () => getBookings({ pageSize: 10000 }),
    { rows: [], total: 0 },
  );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Calendar</h1>
        <p className="mt-1 text-sm text-muted">Production schedule across month, week and day views.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Radio size={22} />} title="No bookings yet" description="Create a booking to see it on the calendar." />
      ) : (
        <CalendarView bookings={rows} />
      )}
    </div>
  );
}
