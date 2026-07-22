import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { VerifyPhoneForm } from "@/features/auth/components/verify-phone-form";
import { getOwnProfile } from "@/features/auth/queries";

export default async function ProfilePage() {
  const result = await getOwnProfile();
  if (!result?.profile) {
    redirect("/login?redirect=/profile");
  }
  const { profile, emailVerified } = result;
  const isVerified = emailVerified && Boolean(profile.phone_verified_at);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>{profile.full_name.slice(0, 1) || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {profile.full_name || "Your profile"}
          </h1>
          <VerifiedBadge verified={isVerified} className="mt-1" />
        </div>
      </div>

      <section className="mb-8 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Public profile</h2>
        <ProfileForm
          fullName={profile.full_name}
          bio={profile.bio ?? ""}
          city={profile.city ?? ""}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-1 text-sm font-medium text-foreground">
          Phone verification
        </h2>
        {profile.phone_verified_at ? (
          <p className="text-sm text-status-success">
            Your phone number is verified.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Verify your phone to list items or request bookings.
            </p>
            <VerifyPhoneForm />
          </>
        )}
      </section>
    </div>
  );
}
