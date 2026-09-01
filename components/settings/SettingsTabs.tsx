"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Radio, MapPin, Users as UsersIcon, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EntityManager } from "@/components/settings/EntityManager";
import { UsersManager } from "@/components/settings/UsersManager";

const TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "channels", label: "Channels", icon: Radio },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { id: "options", label: "Booking Options", icon: SlidersHorizontal },
];

export function SettingsTabs({ settings, channels, locations, users, currentUserId, isAdminUser }: {
  settings: any;
  channels: any[];
  locations: any[];
  users: any[];
  currentUserId?: string;
  isAdminUser: boolean;
}) {
  const [tab, setTab] = useState("general");
  const router = useRouter();
  const toast = useToast();

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch("/api/settings/general", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else { toast("success", res.message); router.refresh(); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.id ? "border-primary text-fg" : "border-transparent text-muted-2 hover:text-fg",
              )}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-fg">General Settings</h2>
          <form onSubmit={saveGeneral} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Organization name</label>
              <input name="org_name" className="input" defaultValue={settings?.org_name ?? "SAT-7 Production"} />
            </div>
            <div>
              <label className="label">Booking prefix</label>
              <input name="booking_prefix" className="input" defaultValue={settings?.booking_prefix ?? "SAT7"} />
              <p className="mt-1 text-xs text-muted-2">Booking numbers are now simple sequential IDs (001, 002, ...).</p>
            </div>
            <div>
              <label className="label">Time zone</label>
              <input name="time_zone" className="input" defaultValue={settings?.time_zone ?? "UTC"} />
            </div>
            <div>
              <label className="label">Date format</label>
              <input name="date_format" className="input" defaultValue={settings?.date_format ?? "MMM d, yyyy"} />
            </div>
            <div>
              <label className="label">Default booking duration (min)</label>
              <input name="default_booking_duration" type="number" className="input" defaultValue={settings?.default_booking_duration ?? 120} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </Card>
      )}

      {tab === "channels" && (
        <Card className="p-5"><EntityManager items={channels} endpoint="channels" title="Channel" nameLabel="Channel name" /></Card>
      )}
      {tab === "locations" && (
        <Card className="p-5"><EntityManager items={locations} endpoint="locations" title="Location" nameLabel="Location name" withAddress /></Card>
      )}
      {tab === "users" && (
        <Card className="p-5">
          {isAdminUser ? (
            <UsersManager users={users} currentUserId={currentUserId} />
          ) : (
            <p className="text-sm text-muted">Administrator access required to manage users.</p>
          )}
        </Card>
      )}
      {tab === "roles" && <RolesPanel isAdminUser={isAdminUser} />}
      {tab === "options" && <OptionsPanel />}
    </div>
  );
}

function RolesPanel({ isAdminUser }: { isAdminUser: boolean }) {
  const roles = [
    { name: "Administrator", desc: "Full access — all bookings, people, programs, settings, users." },
    { name: "Production Manager", desc: "Create/edit/manage bookings, people, programs and channels." },
    { name: "Production User", desc: "Create and update bookings only." },
    { name: "Viewer", desc: "Read-only access to all modules." },
    { name: "Guest", desc: "View-only access; can confirm/cancel own bookings via token." },
  ];
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-base font-semibold text-fg">Roles & Permissions</h2>
      {!isAdminUser && <p className="mb-3 text-sm text-muted">Shown read-only. Only Administrators can change assignments.</p>}
      <div className="space-y-2">
        {roles.map((r) => (
          <div key={r.name} className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/40 p-3">
            <ShieldCheck size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-fg">{r.name}</p>
              <p className="text-xs text-muted">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OptionsPanel() {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-base font-semibold text-fg">Booking Options</h2>
      <p className="text-sm text-muted">
        Transportation types, dress codes and status values are defined once in <code>lib/utils.ts</code> and the
        database <code>CHECK</code> constraints. To add a new option, update the union in <code>lib/types.ts</code>,
        the array in <code>lib/utils.ts</code>, and the matching migration <code>CHECK</code>. See the README.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-surface-2/40 p-3">
          <p className="text-xs font-medium text-muted">Transportation</p>
          <p className="mt-1 text-sm text-fg">Bus · Car · Van · OB Van · Own · Other</p>
        </div>
        <div className="rounded-lg bg-surface-2/40 p-3">
          <p className="text-xs font-medium text-muted">Dress codes</p>
          <p className="mt-1 text-sm text-fg">Formal · Business Casual · Casual · TV Appropriate · Traditional · Other</p>
        </div>
        <div className="rounded-lg bg-surface-2/40 p-3">
          <p className="text-xs font-medium text-muted">Statuses</p>
          <p className="mt-1 text-sm text-fg">Pending · Confirmed · Declined · Reschedule · Cancelled</p>
        </div>
      </div>
    </Card>
  );
}
