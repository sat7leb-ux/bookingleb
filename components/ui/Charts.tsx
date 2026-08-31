"use client";

import { cn } from "@/lib/utils";

export function BarList({
  data,
  color = "rgb(var(--primary))",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="w-7 shrink-0 text-right text-xs font-medium text-fg">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data,
  size = 140,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--surface-2))" strokeWidth={14} />
        {data.map((d) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={14}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-500"
            />
          );
          offset += len;
          return seg;
        })}
        <text x="50%" y="48%" textAnchor="middle" className="fill-fg text-lg font-bold" dominantBaseline="middle">
          {total}
        </text>
        <text x="50%" y="62%" textAnchor="middle" className="fill-muted-2 text-[10px]" dominantBaseline="middle">
          total
        </text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="font-medium text-fg">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniTimeline({
  items,
}: {
  items: { label: string; time: string; color?: string }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", it.color || "bg-primary")} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-fg">{it.label}</p>
            <p className="text-xs text-muted-2">{it.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
