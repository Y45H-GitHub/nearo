"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookingDatePicker } from "@/features/bookings/components/booking-date-picker";
import { PriceBreakdown } from "@/features/bookings/components/price-breakdown";
import { requestBooking } from "@/features/bookings/actions";

export function BookingRequestForm({
  productId,
  pricePerDay,
  securityDeposit,
  blockedRanges,
}: {
  productId: string;
  pricePerDay: number;
  securityDeposit: number;
  blockedRanges: { start_date: string; end_date: string }[];
}) {
  const router = useRouter();
  const [dates, setDates] = useState<{ startDate: string; endDate: string } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const days = dates
    ? Math.round((new Date(dates.endDate).getTime() - new Date(dates.startDate).getTime()) / 86_400_000) + 1
    : 0;
  const subtotal = days * pricePerDay;

  function submit() {
    if (!dates) return;
    setError(null);
    startTransition(async () => {
      const result = await requestBooking({ productId, ...dates, note });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.push(`/bookings/${result.data.bookingId}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <BookingDatePicker blockedRanges={blockedRanges} onChange={setDates} />

      {dates && (
        <PriceBreakdown subtotalAmount={subtotal} depositAmount={securityDeposit} />
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Note to owner (optional)</Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={submit} disabled={!dates || pending}>
        {pending ? "Sending request…" : "Request to book"}
      </Button>
    </div>
  );
}
