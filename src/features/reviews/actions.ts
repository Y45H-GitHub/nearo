"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { submitReviewSchema } from "@/lib/validation/review";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

export async function submitReview(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");

  const parsed = submitReviewSchema.safeParse({ bookingId, rating, comment });
  if (!parsed.success) return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, product_id, customer_id, owner_id, status")
    .eq("id", bookingId)
    .single();
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");
  const b = booking as {
    id: string;
    product_id: string;
    customer_id: string;
    owner_id: string;
    status: string;
  };

  const isCustomer = b.customer_id === user.id;
  const isOwner = b.owner_id === user.id;
  if (!isCustomer && !isOwner) return actionError("NOT_OWNER", "You're not part of this booking.");
  if (!["returned", "completed"].includes(b.status)) {
    return actionError("INVALID_TRANSITION", "This booking isn't eligible for a review yet.");
  }

  const revieweeId = isCustomer ? b.owner_id : b.customer_id;

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", user.id)
    .maybeSingle();
  if (existing) return actionError("VALIDATION_ERROR", "You've already reviewed this booking.");

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
  });
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath(`/listing/${b.product_id}`);
  revalidatePath(`/users/${revieweeId}`);
  return actionOk(undefined);
}
