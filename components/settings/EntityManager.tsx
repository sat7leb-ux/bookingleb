"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export function EntityManager({
  items,
  endpoint,
  title,
  nameLabel,
  withAddress,
}: {
  items: any[];
  endpoint: string; // e.g. "channels" or "locations"
  title: string;
  nameLabel: string;
  withAddress?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ name: "", address: "" });

  function openCreate() { setEditId(null); setForm({ name: "", address: "" }); setOpen(true); }
  function openEdit(it: any) { setEditId(it.id); setForm({ name: it.name, address: it.address ?? "" }); setOpen(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("id", editId ?? ""); fd.append("name", form.name);
    if (withAddress) fd.append("address", form.address);
    const res = await fetch(`/api/${endpoint}`, { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) { toast("error", res.message); return; }
    toast("success", res.message); setOpen(false); router.refresh();
  }
  async function doArchive() {
    const fd = new FormData(); fd.append("id", archiveId ?? "");
    const res = await fetch(`/api/${endpoint}/archive`, { method: "POST", body: fd }).then((r) => r.json());
    if (!res.ok) toast("error", res.message); else { toast("success", res.message); router.refresh(); }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={15} /> Add {title}</Button>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="card flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{it.name}</p>
              {withAddress && it.address && <p className="truncate text-xs text-muted">{it.address}</p>}
            </div>
            <button onClick={() => openEdit(it)} className="btn-ghost text-xs" aria-label="Edit"><Pencil size={14} /></button>
            <button onClick={() => setArchiveId(it.id)} className="btn-ghost text-xs" aria-label="Archive"><Archive size={14} /></button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? `Edit ${title}` : `Add ${title}`}>
        <form id="entity-form" onSubmit={save} className="space-y-3">
          <div><label className="label">{nameLabel} *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          {withAddress && <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>}
        </form>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="entity-form">Save</Button>
        </div>
      </Modal>
      <ConfirmDialog open={!!archiveId} onClose={() => setArchiveId(null)} onConfirm={doArchive} title={`Archive ${title}?`} message="Archived items are hidden from new bookings." />
    </div>
  );
}
