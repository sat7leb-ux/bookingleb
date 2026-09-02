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
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Production schedule across month, week and day views.</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Radio size={22} />} title="No bookings yet" description="Create a booking to see it on the calendar." />
      ) : (
        <CalendarView bookings={rows} />
      )}
    </div>
  );
}
