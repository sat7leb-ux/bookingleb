"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { isDbConfigured } from "@/lib/config";

/**
 * Lightweight "live" indicator. Neon has no Supabase Realtime, so we poll the
 * dashboard every 20s and refresh server-rendered data when something changed.
 * Honest: shows Connected only when DB is configured.
 */
export function RealtimeBadge({ table }: { table: string }) {
  const router = useRouter();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!isDbConfigured()) return;
    setLive(true);
    const interval = setInterval(() => {
      router.refresh();
    }, 20000);
    return () => clearInterval(interval);
  }, [table, router]);

  if (!isDbConfigured()) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted" title="Auto-refreshing">
      <Radio size={12} className={live ? "text-success" : "text-muted-2"} />
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-success animate-pulse-dot" : "bg-muted-2"}`} />
      {live ? "Live" : "Connecting…"}
    </span>
  );
}
