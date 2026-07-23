import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, CancelledByParty } from "@/types/domain";

export type BookingRow = {
  id: string;
  product_id: string;
  customer_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  subtotal_amount: number;
  platform_fee_rate: number | null;
  platform_fee_amount: number | null;
  deposit_amount: number;
  owner_payout_amount: number | null;
  cancelled_by: CancelledByParty | null;
  cancellation_reason: string | null;
  requested_at: string;
  responded_at: string | null;
  started_at: string | null;
  returned_at: string | null;
};

export type BookingListItem = BookingRow & {
  products: { id: string; title: string; cover_image_url: string | null } | null;
};

export async function getCustomerBookings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("bookings")
    .select("*, products (id, title, cover_image_url)")
    .eq("customer_id", user.id)
    .order("requested_at", { ascending: false });

  return (data ?? []) as unknown as BookingListItem[];
}

export async function getOwnerBookings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("bookings")
    .select("*, products (id, title, cover_image_url)")
    .eq("owner_id", user.id)
    .order("requested_at", { ascending: false });

  return (data ?? []) as unknown as BookingListItem[];
}

export async function getBookingDetail(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("bookings")
    .select("*, products (id, title, cover_image_url, price_per_day)")
    .eq("id", bookingId)
    .single();
  if (!data) return null;

  const booking = data as unknown as BookingListItem;
  if (booking.customer_id !== user.id && booking.owner_id !== user.id) return null;

  const viewerRole = booking.owner_id === user.id ? ("owner" as const) : ("customer" as const);
  const counterpartId = viewerRole === "owner" ? booking.customer_id : booking.owner_id;

  const { data: counterpart } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", counterpartId)
    .single();

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  return {
    booking,
    viewerRole,
    counterpart: counterpart as { id: string; full_name: string; avatar_url: string | null } | null,
    viewerHasReviewed: Boolean(existingReview),
  };
}

export async function getAvailabilityBlocks(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_blocks")
    .select("start_date, end_date")
    .eq("product_id", productId)
    .gte("end_date", new Date().toISOString().slice(0, 10));

  return (data ?? []) as { start_date: string; end_date: string }[];
}
