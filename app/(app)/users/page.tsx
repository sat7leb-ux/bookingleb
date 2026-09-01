import { getProfiles } from "@/lib/queries";
import { safe } from "@/lib/queries";
import { isAdmin } from "@/lib/auth";
import { UsersManager } from "@/components/settings/UsersManager";
import { Card } from "@/components/ui/Card";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const admin = await isAdmin();
  const users = await safe(() => getProfiles(), []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Users</h1>
        <p className="mt-1 text-sm text-muted">
          Manage organization members and their roles and permissions.
        </p>
      </div>
      <Card className="p-5">
        {admin ? (
          <UsersManager users={users} currentUserId={users[0]?.id} />
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
            <ShieldCheck size={18} className="mt-0.5 text-warning" />
            <p>
              <span className="font-medium">Administrator access required.</span>
              You need the Administrator role to view and manage users.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
