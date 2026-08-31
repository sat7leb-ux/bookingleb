"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CONFIRMATION_STATUSES, LIVE_RECORDED, cn } from "@/lib/utils";

export function BookingsToolbar({
  channels,
  programs,
  people,
  current,
}: {
  channels: { id: string; name: string }[];
  programs: { id: string; name: string }[];
  people: { id: string; full_name: string }[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const params = new URLSearchParams(current as Record<string, string>);

  function update(key: string, value: string) {
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/bookings?${params.toString()}`);
  }

  function setSearch(v: string) {
    if (v) params.set("q", v);
    else params.delete("q");
    params.delete("page");
  }
  function commitSearch(v: string) {
    if (!v) params.delete("q");
    router.push(`/bookings?${params.toString()}`);
  }

  const hasFilters = ["q", "status", "lr", "program", "channel", "person", "from", "to"].some(
    (k) => params.has(k),
  );

  return (
    <div className="card flex flex-wrap items-center gap-2 p-3">
      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
        <Search size={15} className="text-muted-2" />
        <input
          defaultValue={current.q ?? ""}
          onBlur={(e) => commitSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitSearch((e.target as HTMLInputElement).value)}
          placeholder="Search bookings, guests, programs…"
          className="w-full bg-transparent py-2 text-sm text-fg outline-none placeholder:text-muted-2"
        />
      </div>

      <select className="input max-w-[160px]" value={current.status ?? "all"} onChange={(e) => update("status", e.target.value)}>
        <option value="all">All statuses</option>
        {CONFIRMATION_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select className="input max-w-[140px]" value={current.lr ?? "all"} onChange={(e) => update("lr", e.target.value)}>
        <option value="all">Live & Recorded</option>
        {LIVE_RECORDED.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select className="input max-w-[160px]" value={current.program ?? "all"} onChange={(e) => update("program", e.target.value)}>
        <option value="all">All programs</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select className="input max-w-[160px]" value={current.channel ?? "all"} onChange={(e) => update("channel", e.target.value)}>
        <option value="all">All channels</option>
        {channels.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select className="input max-w-[160px]" value={current.person ?? "all"} onChange={(e) => update("person", e.target.value)}>
        <option value="all">All guests</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>{p.full_name}</option>
        ))}
      </select>
      <input type="date" className="input max-w-[150px]" value={current.from ?? ""} onChange={(e) => update("from", e.target.value)} title="From date" />
      <input type="date" className="input max-w-[150px]" value={current.to ?? ""} onChange={(e) => update("to", e.target.value)} title="To date" />

      {hasFilters && (
        <button
          className="btn-ghost"
          onClick={() => router.push("/bookings")}
        >
          <X size={15} /> Clear
        </button>
      )}
    </div>
  );
}
