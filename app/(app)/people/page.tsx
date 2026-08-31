import { getPeopleWithStats } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { PeopleManager } from "@/components/people/PeopleManager";
import { EmptyState } from "@/components/ui/Card";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const people = await safe(() => getPeopleWithStats(), []);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">People</h1>
        <p className="mt-1 text-sm text-muted">Guests and contacts used across production bookings.</p>
      </div>
      {!people.length ? (
        <EmptyState icon={<Users size={22} />} title="Supabase not connected" description="Configure Supabase to manage people." />
      ) : (
        <PeopleManager people={people} />
      )}
    </div>
  );
}
