"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveDispute } from "@/features/admin/actions";

export function DisputeResolutionForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(outcome: "returned" | "cancelled") {
    if (!notes.trim()) {
      setError("Add a resolution note first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resolveDispute({ bookingId, outcome, notes });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Resolution notes (what was agreed / decided)"
        rows={2}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => submit("returned")}>
          Resolve — release deposit, mark returned
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => submit("cancelled")}>
          Resolve — cancel booking
        </Button>
      </div>
    </div>
  );
}
