"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  sub?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search…",
  allowCreate,
  onCreate,
  createLabel,
  emptyLabel,
}: {
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
  onCreate?: (name: string) => void;
  createLabel?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-left"
      >
        <span className={cn(!selected && "text-muted-2")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-muted-2" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-glow animate-fade-in">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="text-muted-2" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted-2"
              placeholder="Type to search…"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-fg hover:bg-surface-2"
              >
                <span className="truncate">
                  {o.label}
                  {o.sub && <span className="ml-1 text-xs text-muted-2">· {o.sub}</span>}
                </span>
                {o.value === value && <Check size={15} className="text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-2">{emptyLabel ?? "No matches."}</p>
            )}
            {allowCreate && q.trim() && (
              <button
                type="button"
                onClick={() => {
                  onCreate?.(q.trim());
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-surface-2"
              >
                + {createLabel ?? "Create"} “{q.trim()}”
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
