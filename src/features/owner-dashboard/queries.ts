import { createClient } from "@/lib/supabase/server";
import type { BookingListItem } from "@/features/bookings/queries";

export type OwnerDashboardStats = {
  activeListingsCount: number;
  pendingRequestsCount: number;
  thisMonthEarnings: number;
  ratingAvg: number;
  ratingCount: number;
  pendingRequests: BookingListItem[];
  upcomingRentals: BookingListItem[];
  hasAnyListings: boolean;
};

export async function getOwnerDashboard(): Promise<OwnerDashboardStats | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: totalListingsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { count: activeListingsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("status", "available");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, products (id, title, cover_image_url)")
    .eq("owner_id", user.id);
  const all = (bookings ?? []) as unknown as BookingListItem[];

  const pendingRequests = all
    .filter((b) => b.status === "requested")
    .sort((a, b) => new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime());

  const upcomingRentals = all
    .filter((b) => ["accepted", "active"].includes(b.status))
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Earnings are recognized at acceptance (mock capture happens then, per M4),
  // so "this month" is scoped by responded_at, not the rental dates.
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = all
    .filter((b) => b.owner_payout_amount != null && b.responded_at?.slice(0, 7) === thisMonthKey)
    .reduce((sum, b) => sum + (b.owner_payout_amount ?? 0), 0);

  const { data: profile } = await supabase
    .from("profiles")
    .select("rating_avg, rating_count")
    .eq("id", user.id)
    .single();
  const p = profile as { rating_avg: number; rating_count: number } | null;

  return {
    activeListingsCount: activeListingsCount ?? 0,
    pendingRequestsCount: pendingRequests.length,
    thisMonthEarnings,
    ratingAvg: p?.rating_avg ?? 0,
    ratingCount: p?.rating_count ?? 0,
    pendingRequests: pendingRequests.slice(0, 5),
    upcomingRentals: upcomingRentals.slice(0, 5),
    hasAnyListings: (totalListingsCount ?? 0) > 0,
  };
}

export type EarningsRow = BookingListItem;

export async function getOwnerEarnings(): Promise<{ rows: EarningsRow[]; totalNet: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], totalNet: 0 };

  // owner_payout_amount is only ever set by acceptBooking — filtering on it
  // finds every booking that was accepted, regardless of what happened after.
  // Cancelled bookings are excluded: the customer was refunded, so there's no
  // coherent payout to show for them even though the field is still set.
  const { data } = await supabase
    .from("bookings")
    .select("*, products (id, title, cover_image_url)")
    .eq("owner_id", user.id)
    .not("owner_payout_amount", "is", null)
    .in("status", ["accepted", "active", "returned", "completed", "disputed"])
    .order("responded_at", { ascending: false });

  const rows = (data ?? []) as unknown as EarningsRow[];
  const totalNet = rows.reduce((sum, r) => sum + (r.owner_payout_amount ?? 0), 0);
  return { rows, totalNet };
}
