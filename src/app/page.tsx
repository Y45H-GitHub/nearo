import Link from "next/link";
import { SearchBar } from "@/components/shared/search-bar";
import { ListingCard } from "@/features/listings/components/listing-card";
import { getCategoryTree, getExploreListings } from "@/features/listings/queries";
import { getWishlistedProductIds } from "@/features/wishlist/queries";
import { getOwnProfile } from "@/features/auth/queries";

const TRENDING = ["Camera", "Drone", "Tent", "Power drill", "Projector", "Bicycle"];

const TESTIMONIALS = [
  {
    quote: "Rented a pressure washer for one Saturday instead of buying one I'd use twice a year.",
    name: "Rahul",
  },
  {
    quote: "My drone sits idle most of the month — now it pays for itself.",
    name: "Priya",
  },
  {
    quote: "Booking felt as easy as Airbnb. Picked up the same afternoon.",
    name: "Ankit",
  },
];

export default async function Home() {
  const [categories, recentlyListed, wishlisted, own] = await Promise.all([
    getCategoryTree(),
    getExploreListings({ sort: "newest" }),
    getWishlistedProductIds(),
    getOwnProfile(),
  ]);

  const recent = recentlyListed.slice(0, 8);
  const listCta = own?.profile ? "/owner/listings/new" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          What do you need today?
        </h1>
        <SearchBar variant="hero" />
        <div className="flex flex-wrap justify-center gap-2">
          {TRENDING.map((term) => (
            <Link
              key={term}
              href={`/explore?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
          <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2 sm:row-span-2">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Popular categories
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {categories.topLevel.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/explore?category=${c.slug}`}
                  className="rounded-lg border border-border p-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2 sm:row-span-2">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Recently listed
            </h2>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No listings yet in your city — be the first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recent.slice(0, 4).map((p) => (
                  <ListingCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    pricePerDay={p.price_per_day}
                    city={p.city}
                    coverImageUrl={p.cover_image_url}
                    showWishlist
                    wishlisted={wishlisted.has(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
        <h2 className="mb-8 text-2xl font-semibold text-foreground">How it works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Find or list", body: "Search nearby, or list something you own." },
            { step: "2", title: "Request to book", body: "Pick your dates and send a request." },
            { step: "3", title: "Meet & rent", body: "Owner accepts, you pick up, and you're set." },
          ].map((s) => (
            <div key={s.step} className="rounded-lg border border-border p-5">
              <p className="mb-2 text-sm font-semibold text-primary">Step {s.step}</p>
              <p className="mb-1 font-medium text-foreground">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-sm font-medium text-muted-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-6 py-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Got something sitting idle? Start earning.
        </h2>
        <Link
          href={listCta}
          className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          List your item
        </Link>
      </section>
    </div>
  );
}
