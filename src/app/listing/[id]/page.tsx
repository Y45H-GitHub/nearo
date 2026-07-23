import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { getWishlistedProductIds } from "@/features/wishlist/queries";
import { getProductDetail } from "@/features/listings/queries";
import { incrementViewCount } from "@/features/listings/actions";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProductDetail(id);
  if (!result) notFound();
  const { product, images, owner, isOwner } = result;

  if (!isOwner && !["available", "booking_requested", "booked", "rented", "returned"].includes(product.status)) {
    notFound();
  }

  if (!isOwner) void incrementViewCount(product.id);
  const wishlisted = (await getWishlistedProductIds()).has(product.id);

  const cover = images.find((i) => i.is_cover) ?? images[0];
  const gallery = images.filter((i) => i.id !== cover?.id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {isOwner && (
        <div className="mb-4 flex items-center gap-2">
          <StatusPill status={product.status} />
          <Link
            href={`/owner/listings/${product.id}/edit`}
            className="text-sm text-foreground underline underline-offset-4"
          >
            Edit listing
          </Link>
        </div>
      )}

      <div className="mb-6 grid grid-cols-4 gap-2">
        <div className="relative col-span-4 aspect-16/9 overflow-hidden rounded-lg bg-muted sm:col-span-3">
          {cover && <Image src={cover.url} alt={product.title} fill className="object-cover" priority />}
        </div>
        <div className="col-span-4 grid grid-cols-4 gap-2 sm:col-span-1 sm:grid-cols-1">
          {gallery.slice(0, 3).map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h1 className="text-2xl font-semibold text-foreground">{product.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CONDITION_LABELS[product.condition]}
            {product.brand ? ` · ${product.brand}` : ""}
            {product.model ? ` ${product.model}` : ""}
          </p>

          {owner && (
            <Link
              href={`/users/${owner.id}`}
              className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <Avatar className="size-10">
                <AvatarImage src={owner.avatar_url ?? undefined} />
                <AvatarFallback>{owner.full_name.slice(0, 1) || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{owner.full_name}</p>
                <VerifiedBadge verified={Boolean(owner.phone_verified_at)} />
              </div>
            </Link>
          )}

          <p className="mt-6 whitespace-pre-line text-sm text-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Pickup</dt>
              <dd className="text-foreground">{product.pickup_available ? "Available" : "Not available"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-foreground">
                {product.delivery_available
                  ? `Within ${product.delivery_radius_km ?? "?"} km`
                  : "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-foreground">{product.city}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Minimum rental</dt>
              <dd className="text-foreground">{product.min_rental_days} day(s)</dd>
            </div>
          </dl>
        </div>

        <div className="sm:col-span-1">
          <div className="relative rounded-lg border border-border bg-card p-5">
            {!isOwner && (
              <WishlistButton
                productId={product.id}
                initialWishlisted={wishlisted}
                className="absolute top-4 right-4"
              />
            )}
            <p className="text-xl font-semibold text-foreground">
              ₹{product.price_per_day.toLocaleString("en-IN")}
              <span className="text-sm font-normal text-muted-foreground"> / day</span>
            </p>
            {product.security_deposit > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                + ₹{product.security_deposit.toLocaleString("en-IN")} refundable deposit
              </p>
            )}
            {isOwner ? (
              <Button className="mt-4 w-full" disabled>
                This is your listing
              </Button>
            ) : product.status === "available" ? (
              <Button className="mt-4 w-full" asChild>
                <Link href={`/listing/${product.id}/book`}>Request to book</Link>
              </Button>
            ) : (
              <Button className="mt-4 w-full" disabled>
                Not available right now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
