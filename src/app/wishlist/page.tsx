import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/features/listings/components/listing-card";
import { getWishlistProducts } from "@/features/wishlist/queries";

export default async function WishlistPage() {
  const products = await getWishlistProducts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Wishlist</h1>

      {products.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on any listing to keep track of it here."
          actionHref="/explore"
          actionLabel="Explore listings"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ListingCard
              key={p.id}
              id={p.id}
              title={p.title}
              pricePerDay={p.price_per_day}
              city={p.city}
              coverImageUrl={p.cover_image_url}
              showWishlist
              wishlisted
            />
          ))}
        </div>
      )}
    </div>
  );
}
