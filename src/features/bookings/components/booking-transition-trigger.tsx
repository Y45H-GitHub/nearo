"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Fires the lazy status-transition check once on mount — see
 * api-design.md § 3. Silent no-op if nothing changed.
 */
export function BookingTransitionTrigger({ bookingId }: { bookingId: string }) {
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/transition`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) router.refresh();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return null;
}
