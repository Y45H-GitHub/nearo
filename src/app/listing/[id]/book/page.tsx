import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductDetail } from "@/features/listings/queries";
import { getAvailabilityBlocks } from "@/features/bookings/queries";
import { getOwnProfile } from "@/features/auth/queries";
import { VerifyPhoneForm } from "@/features/auth/components/verify-phone-form";
import { BookingRequestForm } from "@/features/bookings/components/booking-request-form";

export default async function BookingRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProductDetail(id);
  if (!result || result.product.status !== "available") notFound();

  const own = await getOwnProfile();
  if (!own?.profile) redirect(`/login?redirect=/listing/${id}/book`);
  const isVerified = own.emailVerified && Boolean(own.profile.phone_verified_at);

  const { product, images } = result;
  const cover = images.find((i) => i.is_cover) ?? images[0];
  const blockedRanges = await getAvailabilityBlocks(id);

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href={`/listing/${id}`} className="text-sm text-muted-foreground">
        ← Back to listing
      </Link>

      <div className="my-4 flex items-center gap-3 rounded-lg border border-border p-3">
        {cover && (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image src={cover.url} alt="" fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{product.title}</p>
          <p className="text-sm text-muted-foreground">
            ₹{product.price_per_day.toLocaleString("en-IN")}/day
          </p>
        </div>
      </div>

      {!isVerified ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="mb-2 font-medium text-foreground">Verify your phone to continue</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {own.emailVerified
              ? "One quick step before you can request a booking."
              : "Confirm your email first (check your inbox), then verify your phone here."}
          </p>
          {own.emailVerified && <VerifyPhoneForm />}
        </div>
      ) : (
        <BookingRequestForm
          productId={product.id}
          pricePerDay={product.price_per_day}
          securityDeposit={product.security_deposit}
          blockedRanges={blockedRanges}
        />
      )}
    </div>
  );
}
