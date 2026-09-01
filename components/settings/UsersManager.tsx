"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ROLES } from "@/lib/utils";

export function UsersManager({ users, currentUserId }: { users: any[]; currentUserId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ email: "", full_name: "", role: "Production User" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("email", form.email);
    fd.append("full_name", form.full_name);
    fd.append("role", form.role);
    const res = await fetch("/api/settings/users", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) { toast("error", res.message); return; }
    toast("success", res.message);
    setOpen(false);
    router.refresh();
  }

  async function changeRole(u: any, role: string) {
    const fd = new FormData();
    fd.append("id", u.id);
    fd.append("role", role);
    const res = await fetch("/api/settings/users/role", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else { toast("success", res.message); router.refresh(); }
  }

  async function deleteUser() {
    const fd = new FormData();
    fd.append("id", deleteId ?? "");
    const res = await fetch("/api/settings/users", { method: "DELETE", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else { setDeleteMsg(res.message); setDeleteId(null); router.refresh(); }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ email: "", full_name: "", role: "Production User" }); setOpen(true); }}><Plus size={15} /> Add User</Button>
      </div>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className={`card flex flex-wrap items-center gap-3 p-3 ${u.active ? "" : "opacity-50"}`}>
            <Avatar name={u.full_name ?? u.email} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{u.full_name ?? u.email}</p>
              <p className="truncate text-xs text-muted">{u.email}{u.active ? "" : " · inactive"}</p>
            </div>
            <select
              value={u.role}
              disabled={u.id === currentUserId}
              onChange={(e) => changeRole(u, e.target.value)}
              className="input max-w-[160px]"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={() => setDeleteId(u.id)}
              disabled={u.id === currentUserId}
              className="btn-soft text-xs disabled:opacity-30"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ))}
      </div>

      {deleteMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          {deleteMsg}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add User">
        <form id="user-form" onSubmit={create} className="space-y-3">
          <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Full name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted-2">A temporary password is generated and shown after creation. The user can change it on next login.</p>
        </form>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="user-form">Create</Button>
        </div>
      </Modal>
    </div>
  );
}
