"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReview } from "@/features/reviews/actions";

export function ReviewForm({
  bookingId,
  revieweeName,
}: {
  bookingId: string;
  revieweeName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (rating === 0) {
      setError("Pick a rating first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReview(bookingId, rating, comment);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setSubmitted(true);
      router.refresh();
    });
  }

  if (submitted) {
    return <p className="text-sm text-status-success">Thanks — your review was submitted.</p>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium text-foreground">Review {revieweeName}</p>

      <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-6",
                i <= (hoverRating || rating)
                  ? "fill-status-pending text-status-pending"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional — how was the rental?"
        rows={3}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button size="sm" onClick={submit} disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}
