"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, Search, Clapperboard } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export function ProgramsManager({ programs, channels }: { programs: any[]; channels: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  function openCreate() {
    setEditId(null);
    setForm({ name: "", channel_id: "", company: "", default_location: "", default_place_in: "", default_top_camera: "", notes: "" });
    setOpen(true);
  }
  function openEdit(p: any) {
    setEditId(p.id);
    setForm({ name: p.name, channel_id: p.channel_id ?? "", company: p.company ?? "", default_location: p.default_location ?? "", default_place_in: p.default_place_in ?? "", default_top_camera: p.default_top_camera ?? "", notes: p.notes ?? "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("id", editId ?? "");
    fd.append("name", form.name);
    fd.append("channel_id", form.channel_id ?? "");
    fd.append("company", form.company ?? "");
    fd.append("default_location", form.default_location ?? "");
    fd.append("default_place_in", form.default_place_in ?? "");
    fd.append("default_top_camera", form.default_top_camera ?? "");
    fd.append("notes", form.notes ?? "");
    const res = await fetch("/api/programs", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) { toast("error", res.message); return; }
    toast("success", res.message);
    setOpen(false);
    router.refresh();
  }

  async function doArchive() {
    const fd = new FormData();
    fd.append("id", archiveId ?? "");
    const res = await fetch("/api/programs/archive", { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message);
    else toast("success", res.message);
    router.refresh();
  }

  const filtered = programs.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
          <Search size={15} className="text-muted-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search programs…" className="w-full bg-transparent py-2 text-sm text-fg outline-none placeholder:text-muted-2" />
        </div>
        <Button onClick={openCreate}><Plus size={15} /> Add Program</Button>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Clapperboard size={22} />} title="No programs found" description="Programs auto-fill booking defaults when selected." action={<Button onClick={openCreate}><Plus size={15} /> Add Program</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{p.name}</p>
                  <p className="truncate text-xs text-muted">{p.channel?.name ?? p.company ?? "—"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-2 hover:bg-surface-2 hover:text-fg" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setArchiveId(p.id)} className="rounded-md p-1.5 text-muted-2 hover:bg-surface-2 hover:text-danger" aria-label="Archive"><Archive size={14} /></button>
                </div>
              </div>
              {p.default_location && <p className="mt-2 text-xs text-muted">📍 {p.default_location}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Program" : "Add Program"}>
        <form id="program-form" onSubmit={save} className="space-y-3">
          <div><label className="label">Program name *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Channel</label>
              <SearchableSelect options={channels.map((c) => ({ value: c.id, label: c.name }))} value={form.channel_id || null} onChange={(v) => setForm({ ...form, channel_id: v })} placeholder="Select channel" />
            </div>
            <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          </div>
          <div><label className="label">Default location</label><input className="input" value={form.default_location} onChange={(e) => setForm({ ...form, default_location: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Default Place-In</label><input className="input" value={form.default_place_in} onChange={(e) => setForm({ ...form, default_place_in: e.target.value })} /></div>
            <div><label className="label">Default Top Camera</label><input className="input" value={form.default_top_camera} onChange={(e) => setForm({ ...form, default_top_camera: e.target.value })} /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </form>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="program-form">Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!archiveId} onClose={() => setArchiveId(null)} onConfirm={doArchive} title="Archive program?" message="Archived programs are hidden from new bookings but their history is kept." />
    </div>
  );
}
