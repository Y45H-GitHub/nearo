import { createClient } from "@/lib/supabase/server";

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { id: string; full_name: string; avatar_url: string | null } | null;
};

export async function getReviewsForUser(userId: string): Promise<ReviewRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer_id: string;
  }[];
  if (reviews.length === 0) return [];

  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", reviewerIds);
  const byId = new Map(
    (reviewers ?? []).map((p) => [
      (p as { id: string }).id,
      p as { id: string; full_name: string; avatar_url: string | null },
    ]),
  );

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer: byId.get(r.reviewer_id) ?? null,
  }));
}
