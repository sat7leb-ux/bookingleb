"use client";
import type { ConfirmationStatus } from "@/lib/types";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { CONFIRMATION_STATUSES } from "@/lib/utils";
import { setBookingStatus } from "@/services/bookings";

export function StatusSelect({ bookingId, current, canChange }: { bookingId: string; current: ConfirmationStatus; canChange: boolean }) {
  const [processing, setProcessing] = useState(false);

  if (!canChange) return <StatusBadge status={current} />;

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ConfirmationStatus;
    if (next === current) return;
    setProcessing(true);
    const res = await setBookingStatus(bookingId, next);
    setProcessing(false);
    if (!res.ok) alert(res.message);
  }

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={current} />
      <select
        disabled={processing}
        value={current}
        onChange={onChange}
        className="input text-xs py-1 px-2"
      >
        {CONFIRMATION_STATUSES.filter((s) => s !== current).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
