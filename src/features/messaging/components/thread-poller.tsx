"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Polling-based "fake realtime" per implementation-plan.md M5 — refreshes
 * the server-rendered thread every few seconds so a reply shows up without
 * a manual reload. A Supabase Realtime subscription is the drop-in upgrade
 * if this feels too laggy in practice; not built now.
 */
export function ThreadPoller({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, router]);

  return null;
}
