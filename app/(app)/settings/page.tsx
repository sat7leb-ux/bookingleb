import { getOrgSettings, getChannels, getLocations } from "@/lib/queries";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getProfiles } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { EmptyState } from "@/components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const admin = await isAdmin();
  const [settings, channels, locations, profiles] = await Promise.all([
    safe(() => getOrgSettings(), null),
    safe(() => getChannels(), []),
    safe(() => getLocations(), []),
    safe(() => getProfiles(), []),
  ]);
  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Organization, channels, locations, users and permissions.</p>
        </div>
      </div>
      {!settings && !channels.length && !profiles.length ? (
        <EmptyState icon={<SettingsIcon size={22} />} title="Supabase not connected" description="Configure Supabase to access settings." />
      ) : (
        <SettingsTabs
          settings={settings}
          channels={channels}
          locations={locations}
          users={profiles}
          currentUserId={user?.id}
          isAdminUser={admin}
        />
      )}
    </div>
  );
}
