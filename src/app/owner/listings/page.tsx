import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { getOwnerListings } from "@/features/listings/queries";
import { getOwnProfile } from "@/features/auth/queries";
import { deleteListing, pauseListing, publishListing, resumeListing } from "@/features/listings/actions";

export default async function OwnerListingsPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/owner/listings");

  const listings = await getOwnerListings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">My listings</h1>
        <Button asChild>
          <Link href="/owner/listings/new">New listing</Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="List your first item in under 5 minutes"
          description="Anything sitting idle — a camera, a tool, a tent — can start earning."
          actionHref="/owner/listings/new"
          actionLabel="Create a listing"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((product) => {
            async function publish() {
              "use server";
              await publishListing(product.id);
            }
            async function pause() {
              "use server";
              await pauseListing(product.id);
            }
            async function resume() {
              "use server";
              await resumeListing(product.id);
            }
            async function remove() {
              "use server";
              await deleteListing(product.id);
            }

            return (
            <li
              key={product.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{product.title}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{product.price_per_day.toLocaleString("en-IN")}/day · {product.city}
                </p>
                <StatusPill status={product.status} className="mt-1" />
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/listing/${product.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/owner/listings/${product.id}/edit`}>Edit</Link>
                </Button>
                {product.status === "draft" && (
                  <form action={publish}>
                    <Button type="submit" size="sm">
                      Publish
                    </Button>
                  </form>
                )}
                {product.status === "available" && (
                  <form action={pause}>
                    <Button type="submit" variant="outline" size="sm">
                      Pause
                    </Button>
                  </form>
                )}
                {product.status === "hidden" && (
                  <form action={resume}>
                    <Button type="submit" variant="outline" size="sm">
                      Resume
                    </Button>
                  </form>
                )}
                <form action={remove}>
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
