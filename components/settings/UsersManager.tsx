"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ROLES } from "@/lib/utils";

export function UsersManager({ users, currentUserId }: { users: any[]; currentUserId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState<any>({ email: "", full_name: "", role: "Production User", password: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState("");

  function openAddModal() {
    setForm({ email: "", full_name: "", role: "Production User", password: "" });
    setIsEditing(false);
    setEditingUser(null);
    setOpen(true);
  }

  function openEditModal(user: any) {
    setForm({ email: user.email, full_name: user.full_name || "", role: user.role, password: "" });
    setIsEditing(true);
    setEditingUser(user);
    setOpen(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("email", form.email);
    fd.append("full_name", form.full_name);
    fd.append("role", form.role);
    if (!isEditing || form.password) {
      fd.append("password", form.password);
    }
    const url = isEditing ? "/api/settings/users/role" : "/api/settings/users";
    const method = "POST";
    const res = await fetch(url, { method, body: fd }).then((r) => r.json());
    if (!res.ok) { toast("error", res.message); return; }
    toast("success", res.message);
    setOpen(false);
    setIsEditing(false);
    setEditingUser(null);
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
        <Button onClick={openAddModal}><Plus size={15} /> Add User</Button>
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
            {u.id === editingUser?.id && isEditing ? (
              <button
                onClick={() => { setIsEditing(false); setEditingUser(null); setOpen(false); }}
                className="btn-soft text-xs"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                onClick={() => openEditModal(u)}
                disabled={u.id === currentUserId}
                className="btn-soft text-xs disabled:opacity-30"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
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

      <Modal
        open={open}
        onClose={() => { setOpen(false); setIsEditing(false); setEditingUser(null); }}
        title={isEditing ? "Edit User" : "Add User"}
      >
        <form id="user-form" onSubmit={submitForm} className="space-y-3">
          {!isEditing && (
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {!isEditing && (
            <div>
              <label className="label">Password *</label>
              <input
                className="input"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password for this user"
              />
            </div>
          )}
          <p className="text-xs text-muted-2">
            {isEditing ? "Leave password blank to keep the current password." : "The user can change their password after first login."}
          </p>
        </form>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setOpen(false); setIsEditing(false); setEditingUser(null); }}>Cancel</Button>
          <Button type="submit" form="user-form">{isEditing ? "Save Changes" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
