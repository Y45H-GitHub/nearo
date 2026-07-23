import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  count,
  size = "md",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i <= Math.round(value) ? "fill-status-pending text-status-pending" : "text-muted-foreground/25",
            )}
          />
        ))}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          {count > 0 ? `${value.toFixed(1)} (${count})` : "No reviews yet"}
        </span>
      )}
    </span>
  );
}
