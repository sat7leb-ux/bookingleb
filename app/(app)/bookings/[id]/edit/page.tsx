import { notFound } from "next/navigation";
import { getBookingById, getLookupData } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { EmptyState } from "@/components/ui/Card";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const [data, lookup] = await Promise.all([
    safe(() => getBookingById(params.id), null),
    safe(() => getLookupData(), { people: [], programs: [], channels: [], locations: [] }),
  ]);
  if (!data || !data.booking) notFound();

  const initial = {
    id: data.booking.id,
    person_id: data.booking.person_id,
    guest_ids: (data.guests ?? []).map((g: any) => g.id),
    program_id: data.booking.program_id,
    channel_id: data.booking.channel_id,
    production_date: data.booking.production_date,
    call_time: data.booking.call_time,
    start_time: data.booking.start_time,
    end_time: data.booking.end_time,
    live_recorded: data.booking.live_recorded,
    episode_number: data.booking.episode_number,
    recorded_episodes_count: data.booking.recorded_episodes_count,
    location_id: data.booking.location_id,
    extra_notes: data.booking.extra_notes,
    requirements: data.requirements
      ? {
          place_in: data.requirements.place_in,
          place_in_time: data.requirements.place_in_time,
          place_in_location: data.requirements.place_in_location,
          place_in_notes: data.requirements.place_in_notes,
          top_camera: data.requirements.top_camera,
          top_camera_time: data.requirements.top_camera_time,
          top_camera_location: data.requirements.top_camera_location,
          top_camera_notes: data.requirements.top_camera_notes,
        }
      : {},
    transportation: data.transportation
      ? {
          type: data.transportation.type,
          departure_time: data.transportation.departure_time,
          pickup_location: data.transportation.pickup_location,
          driver: data.transportation.driver,
          notes: data.transportation.notes,
        }
      : { type: "Car" },
    dress_code: data.dress ? { code: data.dress.code, notes: data.dress.notes } : { code: "TV Appropriate" },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Edit Booking</h1>
        <p className="mt-1 font-mono text-xs text-muted">{data.booking.booking_number}</p>
      </div>
      <BookingWizard
        people={lookup.people}
        programs={lookup.programs}
        channels={lookup.channels}
        locations={lookup.locations}
        initial={initial}
        editMode
      />
    </div>
  );
}
