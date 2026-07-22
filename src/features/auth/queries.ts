import { createClient } from "@/lib/supabase/server";

export type ProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone_verified_at: string | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
};

export async function getOwnProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, bio, city, phone_verified_at, rating_avg, rating_count, created_at",
    )
    .eq("id", user.id)
    .single();

  return {
    profile: data as ProfileRow | null,
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

export async function getPublicProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, bio, city, phone_verified_at, rating_avg, rating_count, created_at",
    )
    .eq("id", id)
    .single();

  return data as ProfileRow | null;
}
