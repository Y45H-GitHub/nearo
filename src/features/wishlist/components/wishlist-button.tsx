"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/features/wishlist/actions";

export function WishlistButton({
  productId,
  initialWishlisted,
  className,
}: {
  productId: string;
  initialWishlisted: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (!result.ok) {
            if (result.error.code === "UNAUTHENTICATED") {
              router.push("/login");
            }
            return;
          }
          setWishlisted(result.data.wishlisted);
        });
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur transition-colors",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4",
          wishlisted ? "fill-primary text-primary" : "text-foreground",
        )}
      />
    </button>
  );
}
