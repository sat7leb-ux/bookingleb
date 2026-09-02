import { getPrograms, getChannels } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { ProgramsManager } from "@/components/programs/ProgramsManager";
import { EmptyState } from "@/components/ui/Card";
import { Clapperboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const [programs, channels] = await Promise.all([
    safe(() => getPrograms(), []),
    safe(() => getChannels(), []),
  ]);
  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Programs</h1>
          <p className="page-subtitle">Programs carry default production settings applied to new bookings.</p>
        </div>
      </div>
      {!programs.length ? (
        <EmptyState icon={<Clapperboard size={22} />} title="Supabase not connected" description="Configure Supabase to manage programs." />
      ) : (
        <ProgramsManager programs={programs} channels={channels} />
      )}
    </div>
  );
}
