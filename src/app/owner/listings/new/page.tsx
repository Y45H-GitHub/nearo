import { redirect } from "next/navigation";
import { getOwnProfile } from "@/features/auth/queries";
import { VerifyPhoneForm } from "@/features/auth/components/verify-phone-form";
import { ListingWizard } from "@/features/listings/components/listing-wizard";
import { getCategoryTree } from "@/features/listings/queries";

export default async function NewListingPage() {
  const result = await getOwnProfile();
  if (!result?.profile) redirect("/login?redirect=/owner/listings/new");

  const isVerified = result.emailVerified && Boolean(result.profile.phone_verified_at);
  if (!isVerified) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Verify your phone to list an item
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {result.emailVerified
            ? "You just need phone verification — it takes a minute."
            : "Confirm your email first (check your inbox), then verify your phone here."}
        </p>
        {result.emailVerified && <VerifyPhoneForm />}
      </div>
    );
  }

  const categories = await getCategoryTree();
  return <ListingWizard mode="create" categories={categories} />;
}
