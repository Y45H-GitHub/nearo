"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelBooking, markReturned } from "@/features/bookings/actions";
import type { BookingStatus } from "@/types/domain";

export function BookingActions({
  bookingId,
  status,
  viewerRole,
}: {
  bookingId: string;
  status: BookingStatus;
  viewerRole: "customer" | "owner";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDamage, setConfirmingDamage] = useState(false);

  const canCancel =
    (viewerRole === "customer" && ["requested", "accepted"].includes(status)) ||
    (viewerRole === "owner" && status === "accepted");
  const canMarkReturned = ["accepted", "active"].includes(status);

  function doCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (!result.ok) setError(result.error.message);
      else router.refresh();
    });
  }

  function doMarkReturned(damageReported: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await markReturned(bookingId, damageReported);
      if (!result.ok) setError(result.error.message);
      else router.refresh();
    });
  }

  if (!canCancel && !canMarkReturned) return null;

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {canMarkReturned && !confirmingDamage && (
          <>
            <Button size="sm" disabled={pending} onClick={() => doMarkReturned(false)}>
              Mark returned — no issues
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmingDamage(true)}
            >
              Report an issue
            </Button>
          </>
        )}
        {confirmingDamage && (
          <>
            <p className="w-full text-sm text-muted-foreground">
              This opens a dispute for admin review — no automatic deposit release.
            </p>
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => doMarkReturned(true)}>
              Confirm dispute
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingDamage(false)}>
              Cancel
            </Button>
          </>
        )}
        {canCancel && !confirmingDamage && (
          <Button size="sm" variant="outline" disabled={pending} onClick={doCancel}>
            Cancel booking
          </Button>
        )}
      </div>
    </div>
  );
}
