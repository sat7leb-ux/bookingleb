"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Plus, Pencil, X, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Profile } from "@/lib/types";

export function UsersManager({ users, currentUserId }: { users: Profile[]; currentUserId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState("");

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/settings/users", {
      method: "POST",
      body: fd,
      headers: { "x-user-id": currentUserId ?? "" },
    }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else {
      toast("success", res.message);
      setOpen(false);
      setIsEditing(false);
      setEditingUser(null);
      router.refresh();
    }
  }

  async function updateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingUser) return;
    const fd = new FormData(e.currentTarget);
    fd.append("id", editingUser.id);
    const res = await fetch("/api/settings/users", {
      method: "PATCH",
      body: fd,
      headers: { "x-user-id": currentUserId ?? "" },
    }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else {
      toast("success", res.message);
      setOpen(false);
      setIsEditing(false);
      setEditingUser(null);
      router.refresh();
    }
  }

  async function changeRole(u: Profile, role: string) {
    const fd = new FormData();
    fd.append("id", u.id);
    fd.append("role", role);
    const res = await fetch("/api/settings/users/role", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else { toast("success", res.message); router.refresh(); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const fd = new FormData();
    fd.append("id", deleteId);
    const res = await fetch("/api/settings/users", { method: "DELETE", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else {
      toast("success", res.message);
      setDeleteMsg(res.message);
      setDeleteId(null);
      router.refresh();
    }
  }

  function openAddModal() {
    setEditingUser(null);
    setIsEditing(false);
    setOpen(true);
  }

  function openEditModal(u: Profile) {
    setEditingUser(u);
    setIsEditing(true);
    setOpen(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={openAddModal}><Plus size={15} /> Add User</Button>
      </div>

      {deleteMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          {deleteMsg}
        </div>
      )}

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
              disabled={!currentUserId || u.id === currentUserId}
              onChange={(e) => changeRole(u, e.target.value)}
              className="btn-soft h-8 text-xs"
            >
              {["Administrator","Production Manager","Production User","Viewer","Guest"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
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
                disabled={!currentUserId || u.id === currentUserId}
                className="btn-soft text-xs disabled:opacity-30"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
            <button
              onClick={() => setDeleteId(u.id)}
              disabled={!currentUserId || u.id === currentUserId}
              className="btn-soft text-xs text-danger disabled:opacity-30"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setIsEditing(false); setEditingUser(null); }}
        title={isEditing ? "Edit User" : "Add User"}
      >
        <form id="user-form" onSubmit={isEditing ? updateUser : submitForm} className="space-y-3">
          <div>
            <label className="text-xs text-muted">Full name</label>
            <input name="full_name" defaultValue={editingUser?.full_name ?? ""} className="input mt-1" placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input name="email" type="email" defaultValue={editingUser?.email ?? ""} className="input mt-1" placeholder="email@example.com" required />
          </div>
          {!isEditing && (
            <div>
              <label className="text-xs text-muted">Password</label>
              <input name="password" type="password" className="input mt-1" placeholder="Set password" required minLength={6} />
            </div>
          )}
          <div>
            <label className="text-xs text-muted">Role</label>
            <select name="role" defaultValue={editingUser?.role ?? "Production User"} className="input mt-1">
              {["Administrator","Production Manager","Production User","Viewer","Guest"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setOpen(false); setIsEditing(false); setEditingUser(null); }} className="btn-soft">Cancel</button>
            <button type="submit" className="btn-primary">{isEditing ? "Save" : "Add User"}</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">Are you sure you want to delete this user? This cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setDeleteId(null)} className="btn-soft">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
