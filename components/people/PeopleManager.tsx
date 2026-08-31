"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, Search, Users } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card, EmptyState } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function PeopleManager({ people, initial }: { people: any[]; initial?: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ full_name: "", whatsapp: "", email: "", company: "", department: "", notes: "" });

  function openCreate() {
    setEditId(null);
    setForm({ full_name: "", whatsapp: "", email: "", company: "", department: "", notes: "" });
    setOpen(true);
  }
  function openEdit(p: any) {
    setEditId(p.id);
    setForm({ full_name: p.full_name, whatsapp: p.whatsapp ?? "", email: p.email ?? "", company: p.company ?? "", department: p.department ?? "", notes: p.notes ?? "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("id", editId ?? "");
    fd.append("full_name", form.full_name);
    fd.append("whatsapp", form.whatsapp);
    fd.append("email", form.email);
    fd.append("company", form.company);
    fd.append("department", form.department);
    fd.append("notes", form.notes);
    const res = await fetch("/api/people", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) { toast("error", res.message); return; }
    toast("success", res.message);
    setOpen(false);
    router.refresh();
  }

  async function doArchive() {
    const fd = new FormData();
    fd.append("id", archiveId ?? "");
    const res = await fetch("/api/people/archive", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else toast("success", res.message);
    router.refresh();
  }

  const filtered = people.filter((p) => p.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
          <Search size={15} className="text-muted-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="w-full bg-transparent py-2 text-sm text-fg outline-none placeholder:text-muted-2" />
        </div>
        <Button onClick={openCreate}><Plus size={15} /> Add Person</Button>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Users size={22} />} title="No people found" description="Add guests and contacts to use in bookings." action={<Button onClick={openCreate}><Plus size={15} /> Add Person</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card card-hover p-4">
              <div className="flex items-start gap-3">
                <Avatar name={p.full_name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{p.full_name}</p>
                  <p className="truncate text-xs text-muted">{p.company ?? p.department ?? "—"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-2 hover:bg-surface-2 hover:text-fg" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setArchiveId(p.id)} className="rounded-md p-1.5 text-muted-2 hover:bg-surface-2 hover:text-danger" aria-label="Archive"><Archive size={14} /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-surface-2/50 px-2.5 py-1.5">
                  <p className="text-muted-2">Bookings</p>
                  <p className="font-semibold text-fg">{p.total_bookings ?? 0}</p>
                </div>
                <div className="rounded-lg bg-surface-2/50 px-2.5 py-1.5">
                  <p className="text-muted-2">Last</p>
                  <p className="font-semibold text-fg">{p.last_booking ? p.last_booking.slice(0, 10) : "—"}</p>
                </div>
              </div>
              {p.whatsapp && <p className="mt-2 truncate text-xs text-muted">📱 {p.whatsapp}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Person" : "Add Person"}>
        <form id="person-form" onSubmit={save} className="space-y-3">
          <div><label className="label">Full name *</label><input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </form>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="person-form">Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!archiveId} onClose={() => setArchiveId(null)} onConfirm={doArchive} title="Archive person?" message="Archived people are hidden from new bookings but their history is kept." />
    </div>
  );
}
