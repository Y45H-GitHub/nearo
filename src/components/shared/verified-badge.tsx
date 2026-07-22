import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders only when verified — see database-schema.md § profiles (email + phone verified). */
export function VerifiedBadge({
  verified,
  className,
}: {
  verified: boolean;
  className?: string;
}) {
  if (!verified) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-trust-verified",
        className,
      )}
    >
      <BadgeCheck className="size-3.5" />
      Verified
    </span>
  );
}
