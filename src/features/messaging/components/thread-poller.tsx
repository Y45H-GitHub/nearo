"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markThreadRead } from "@/features/messaging/actions";

/**
 * Polling-based "fake realtime" per implementation-plan.md M5 — refreshes
 * the server-rendered thread every few seconds so a reply shows up without
 * a manual reload. A Supabase Realtime subscription is the drop-in upgrade
 * if this feels too laggy in practice; not built now.
 *
 * Also owns marking the thread read: this must be called from a client
 * effect (not during the page's server render) so that markThreadRead's
 * revalidatePath calls are allowed to run, which is what keeps the header's
 * unread badge and the inbox list in sync as soon as a message is seen.
 */
export function ThreadPoller({ threadId, intervalMs = 4000 }: { threadId: string; intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    void markThreadRead(threadId);
    const id = setInterval(() => {
      void markThreadRead(threadId).then(() => router.refresh());
    }, intervalMs);
    return () => clearInterval(id);
  }, [threadId, intervalMs, router]);

  return null;
}
