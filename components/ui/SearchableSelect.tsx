"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check, ChevronDown, X } from "lucide-react";
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
  multiple,
}: {
  options: Option[];
  value: string | string[] | null;
  onChange: (v: any) => void;
  placeholder?: string;
  allowCreate?: boolean;
  onCreate?: (name: string) => void;
  createLabel?: string;
  emptyLabel?: string;
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const isMulti = !!multiple;
  const values: string[] = isMulti ? ((value as string[]) ?? []) : value ? [value as string] : [];
  const selectedOptions = options.filter((o) => values.includes(o.value));

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

  function toggle(v: string) {
    if (!isMulti) {
      onChange(v);
      setOpen(false);
      setQ("");
      return;
    }
    const next = values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
    onChange(next);
    setQ("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex min-h-[40px] items-center justify-between gap-2 text-left"
      >
        <span className="flex flex-1 flex-wrap gap-1">
          {selectedOptions.length === 0 && <span className="text-muted-2">{placeholder}</span>}
          {selectedOptions.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg"
              onClick={(e) => {
                if (isMulti) {
                  e.stopPropagation();
                  toggle(o.value);
                }
              }}
            >
              {o.label}
              {isMulti && <X size={11} className="text-muted-2" />}
            </span>
          ))}
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
                onClick={() => toggle(o.value)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-fg hover:bg-surface-2"
              >
                <span className="truncate">
                  {o.label}
                  {o.sub && <span className="ml-1 text-xs text-muted-2">· {o.sub}</span>}
                </span>
                {values.includes(o.value) && <Check size={15} className="text-primary" />}
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
                + {createLabel ?? "Create"} "{q.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}