"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Columns3, Square } from "lucide-react";
import { cn, formatDate, isToday } from "@/lib/utils";

const STATUS_HEX: Record<string, string> = {
  "Pending Confirmation": "#f5a623",
  Confirmed: "#34d399",
  Declined: "#f87171",
  "Reschedule Requested": "#a78bfa",
  Cancelled: "#6b7280",
};

type View = "month" | "week" | "day";

export function CalendarView({ bookings }: { bookings: any[] }) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());

  const today = new Date();
  const y = cursor.getFullYear();
  const m = cursor.getMonth();

  const monthStart = new Date(y, m, 1);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: Date[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(new Date(y, m, 1 - firstWeekday + i));
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7 !== 0) cells.push(new Date(y, m, daysInMonth + cells.length - daysInMonth - (daysInMonth)));

  function bookingsOn(date: Date) {
    const key = date.toISOString().slice(0, 10);
    return bookings.filter((b) => b.production_date === key);
  }

  function shift(dir: number) {
    if (view === "month") setCursor(new Date(y, m + dir, 1));
    else if (view === "week") setCursor(new Date(cursor.getTime() + dir * 7 * 864e5));
    else setCursor(new Date(cursor.getTime() + dir * 864e5));
  }

  const label =
    view === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : view === "week"
      ? `Week of ${cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2" onClick={() => shift(-1)} aria-label="Previous"><ChevronLeft size={16} /></button>
          <button className="btn-ghost px-3" onClick={() => setCursor(new Date())}>Today</button>
          <button className="btn-ghost px-2" onClick={() => shift(1)} aria-label="Next"><ChevronRight size={16} /></button>
        </div>
        <h2 className="text-lg font-semibold text-fg">{label}</h2>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize",
                view === v ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
              )}
            >
              {v === "month" ? <CalendarDays size={13} /> : v === "week" ? <Columns3 size={13} /> : <Square size={13} />}
              {v}
            </button>
          ))}
        </div>
        <Link href="/bookings/new" className="btn-primary"><Plus size={15} /> New</Link>
      </div>

      <div className="card overflow-hidden p-3">
        {view === "month" && (
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-1 py-1 text-center text-xs font-medium text-muted-2">{d}</div>
            ))}
            {cells.map((date, i) => {
              const inMonth = date.getMonth() === m;
              const items = bookingsOn(date);
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[84px] rounded-lg border p-1.5 text-xs",
                    inMonth ? "border-border/60 bg-surface-2/30" : "border-transparent bg-surface-2/10 text-muted-2",
                    isToday(date.toISOString().slice(0, 10)) && "border-primary/50",
                  )}
                >
                  <div className={cn("font-medium", isToday(date.toISOString().slice(0, 10)) && "text-primary")}>
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((b) => (
                      <Link
                        key={b.id}
                        href={`/bookings/${b.id}`}
                        className="block truncate rounded px-1 py-0.5 text-[11px] text-fg"
                        style={{ background: `${STATUS_HEX[b.confirmation_status]}22`, borderLeft: `2px solid ${STATUS_HEX[b.confirmation_status]}` }}
                        title={`${b.person?.full_name}${((b as any).guest_count > 1) ? ` +${ (b as any).guest_count - 1 } more` : ""} · ${b.call_time}`}
                      >
                        {b.call_time} {b.person?.full_name}{((b as any).guest_count > 1) && ` +${ (b as any).guest_count - 1 }`}
                      </Link>
                    ))}
                    {items.length > 3 && <p className="px-1 text-[10px] text-muted-2">+{items.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "week" && (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(cursor);
              date.setDate(cursor.getDate() - cursor.getDay() + i);
              const items = bookingsOn(date);
              return (
                <div key={i} className="min-h-[300px] rounded-lg border border-border/60 bg-surface-2/30 p-1.5">
                  <div className={cn("mb-1 text-center text-xs font-medium", isToday(date.toISOString().slice(0, 10)) && "text-primary")}>
                    {date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                  </div>
                  <div className="space-y-1">
                    {items.map((b) => (
                      <Link key={b.id} href={`/bookings/${b.id}`} className="block rounded px-1.5 py-1 text-[11px] text-fg" style={{ background: `${STATUS_HEX[b.confirmation_status]}22`, borderLeft: `2px solid ${STATUS_HEX[b.confirmation_status]}` }}>
                        <p className="font-medium">{b.call_time}</p>
                        <p className="truncate">{b.person?.full_name}{((b as any).guest_count > 1) && ` +${ (b as any).guest_count - 1 }`}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "day" && (
          <div className="space-y-2">
            {bookingsOn(cursor).length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No bookings on this day.</p>
            ) : (
              bookingsOn(cursor).map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/40 p-3 transition-colors hover:bg-surface-2">
                  <span className="h-10 w-1 rounded-full" style={{ background: STATUS_HEX[b.confirmation_status] }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">{b.person?.full_name}{((b as any).guest_count > 1) && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{ (b as any).guest_count } guests</span>}</p>
                    <p className="text-xs text-muted">{b.program?.name} · {b.channel?.name}</p>
                  </div>
                  <div className="text-right text-sm text-fg">{b.call_time}</div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
