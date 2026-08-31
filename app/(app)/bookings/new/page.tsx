import { getLookupData } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { EmptyState } from "@/components/ui/Card";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const lookup = await safe(
    () => getLookupData(),
    { people: [], programs: [], channels: [], locations: [] },
  );
  if (!lookup.people.length && !lookup.programs.length) {
    return (
      <EmptyState
        icon={<Radio size={22} />}
        title="Supabase not connected"
        description="Configure Supabase to load guests, programs, channels and locations for the booking wizard."
      />
    );
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">New Booking</h1>
        <p className="mt-1 text-sm text-muted">Complete the 7-step wizard to schedule a production.</p>
      </div>
      <BookingWizard
        people={lookup.people}
        programs={lookup.programs}
        channels={lookup.channels}
        locations={lookup.locations}
      />
    </div>
  );
}
