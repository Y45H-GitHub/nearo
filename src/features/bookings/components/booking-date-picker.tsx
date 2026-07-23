"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Lightweight stand-in for the full AvailabilityCalendar in
 * component-tree.md — plain date inputs + a blocked-ranges list, not a
 * month-grid widget. Same simplification already applied to the listing
 * wizard's location step; a real calendar UI is a fast-follow.
 */
export function BookingDatePicker({
  blockedRanges,
  onChange,
}: {
  blockedRanges: { start_date: string; end_date: string }[];
  onChange: (dates: { startDate: string; endDate: string } | null) => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const conflict = useMemo(() => {
    if (!startDate || !endDate) return false;
    return blockedRanges.some((b) => startDate <= b.end_date && endDate >= b.start_date);
  }, [startDate, endDate, blockedRanges]);

  function update(nextStart: string, nextEnd: string) {
    setStartDate(nextStart);
    setEndDate(nextEnd);
    const hasConflict =
      nextStart && nextEnd && blockedRanges.some((b) => nextStart <= b.end_date && nextEnd >= b.start_date);
    if (nextStart && nextEnd && nextEnd >= nextStart && !hasConflict) {
      onChange({ startDate: nextStart, endDate: nextEnd });
    } else {
      onChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">From</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => update(e.target.value, endDate)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">To</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate || new Date().toISOString().slice(0, 10)}
            onChange={(e) => update(startDate, e.target.value)}
          />
        </div>
      </div>
      {conflict && (
        <p className="text-sm text-destructive">
          Those dates overlap an existing booking — try a different range.
        </p>
      )}
      {blockedRanges.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground">Already unavailable:</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {blockedRanges.map((b) => (
              <li
                key={`${b.start_date}-${b.end_date}`}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {b.start_date} → {b.end_date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
