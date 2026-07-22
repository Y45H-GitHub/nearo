import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/features/listings/components/listing-card";
import {
  CategoryChips,
  ExploreFilterSidebar,
  SortSelect,
} from "@/features/listings/components/explore-controls";
import { getCategoryTree, getExploreListings } from "@/features/listings/queries";
import { getWishlistedProductIds } from "@/features/wishlist/queries";
import type { ProductCondition } from "@/types/domain";

type SearchParams = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string | string[];
  lat?: string;
  lng?: string;
  radiusKm?: string;
  sort?: string;
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const conditions = sp.condition
    ? ((Array.isArray(sp.condition) ? sp.condition : [sp.condition]) as ProductCondition[])
    : undefined;

  const [listings, categories, wishlisted] = await Promise.all([
    getExploreListings({
      q: sp.q,
      category: sp.category,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      condition: conditions,
      lat: sp.lat ? Number(sp.lat) : undefined,
      lng: sp.lng ? Number(sp.lng) : undefined,
      radiusKm: sp.radiusKm ? Number(sp.radiusKm) : undefined,
      sort: sp.sort as never,
    }),
    getCategoryTree(),
    getWishlistedProductIds(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4">
        <SearchBar defaultValue={sp.q} />
      </div>
      <div className="mb-6">
        <CategoryChips categories={categories.topLevel} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
        <aside className="hidden sm:block">
          <ExploreFilterSidebar />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {listings.length} result{listings.length === 1 ? "" : "s"}
            </p>
            <SortSelect />
          </div>

          {listings.length === 0 ? (
            <EmptyState
              title="No products match yet"
              description="Widen your radius or filters — or be the first to list one like it."
              actionHref="/owner/listings/new"
              actionLabel="List an item"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {listings.map((p) => (
                <ListingCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  pricePerDay={p.price_per_day}
                  city={p.city}
                  coverImageUrl={p.cover_image_url}
                  distanceKm={p.distanceKm ?? undefined}
                  showWishlist
                  wishlisted={wishlisted.has(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
