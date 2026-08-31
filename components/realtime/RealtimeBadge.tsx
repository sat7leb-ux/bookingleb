"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Radio } from "lucide-react";

/**
 * Shows a live connection indicator and revalidates the current route when a
 * row in `table` changes. Uses the browser client (RLS-enforced). Honest: only
 * lights up when Supabase is configured and connected.
 */
export function RealtimeBadge({ table }: { table: string }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = createBrowserSupabaseClient();
    const channel = sb
      .channel(`realtime-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        setLive(true);
        // refresh server-rendered data
        if (typeof window !== "undefined") {
          // debounced refresh
          const t = setTimeout(() => window.location.reload(), 600);
          return () => clearTimeout(t);
        }
      })
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });
    return () => {
      sb.removeChannel(channel);
    };
  }, [table]);

  if (!isSupabaseConfigured()) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted"
      title="Live updates"
    >
      <Radio size={12} className={live ? "text-success" : "text-muted-2"} />
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-success animate-pulse-dot" : "bg-muted-2"}`}
      />
      {live ? "Live" : "Connecting…"}
    </span>
  );
}
