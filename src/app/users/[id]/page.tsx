import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { getPublicProfile } from "@/features/auth/queries";

function memberSince(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>{profile.full_name.slice(0, 1) || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {profile.full_name || "Nearo user"}
          </h1>
          <VerifiedBadge
            verified={Boolean(profile.phone_verified_at)}
            className="mt-1"
          />
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Rating</dt>
          <dd className="text-foreground">
            {profile.rating_count > 0
              ? `★ ${profile.rating_avg.toFixed(1)} (${profile.rating_count})`
              : "No reviews yet"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Member since</dt>
          <dd className="text-foreground">{memberSince(profile.created_at)}</dd>
        </div>
        {profile.city && (
          <div>
            <dt className="text-muted-foreground">City</dt>
            <dd className="text-foreground">{profile.city}</dd>
          </div>
        )}
      </dl>

      {profile.bio && (
        <p className="mt-8 text-sm text-foreground">{profile.bio}</p>
      )}
    </div>
  );
}
