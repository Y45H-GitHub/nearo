import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import type { ProductStatus } from "@/types/domain";

export function ListingCard({
  id,
  title,
  pricePerDay,
  city,
  coverImageUrl,
  status,
}: {
  id: string;
  title: string;
  pricePerDay: number;
  city: string;
  coverImageUrl: string | null;
  status?: ProductStatus;
}) {
  return (
    <Link
      href={`/listing/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full bg-muted">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No photo
          </div>
        )}
        {status && (
          <StatusPill status={status} className="absolute top-2 left-2 shadow-sm" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{city}</p>
        <p className="text-sm font-semibold text-foreground">
          ₹{pricePerDay.toLocaleString("en-IN")}
          <span className="font-normal text-muted-foreground"> / day</span>
        </p>
      </div>
    </Link>
  );
}
