import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/features/reviews/components/rating-stars";
import type { ReviewRow } from "@/features/reviews/queries";

export function ReviewList({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={r.reviewer?.avatar_url ?? undefined} />
              <AvatarFallback>{r.reviewer?.full_name.slice(0, 1) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{r.reviewer?.full_name ?? "Nearo user"}</p>
              <RatingStars value={r.rating} size="sm" />
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          </div>
          {r.comment && <p className="mt-2 text-sm text-foreground">{r.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
