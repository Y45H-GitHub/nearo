"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { paymentProvider } from "@/lib/payments/mock-provider";
import { notify } from "@/lib/notifications/notify";
import { requestBookingSchema, type RequestBookingInput } from "@/lib/validation/booking";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";
import { CANCELLATION_FREE_WINDOW_HOURS, DEFAULT_PLATFORM_FEE_RATE } from "@/config/constants";
import type { BookingRow } from "@/features/bookings/queries";

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

async function getFullName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string> {
  const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  return (data as { full_name?: string } | null)?.full_name || "Someone";
}

async function getProductTitle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
): Promise<string> {
  const { data } = await supabase.from("products").select("title").eq("id", productId).single();
  return (data as { title?: string } | null)?.title || "a listing";
}

export async function requestBooking(
  input: RequestBookingInput,
): Promise<ActionResult<{ bookingId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_verified_at")
    .eq("id", user.id)
    .single();
  const verified =
    Boolean(user.email_confirmed_at) &&
    Boolean((profile as { phone_verified_at?: string | null } | null)?.phone_verified_at);
  if (!verified) {
    return actionError("UNVERIFIED", "Verify your email and phone before requesting a booking.");
  }

  const parsed = requestBookingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }
  const v = parsed.data;

  const { data: product } = await supabase
    .from("products")
    .select("id, owner_id, status, title, price_per_day, security_deposit, min_rental_days, max_rental_days")
    .eq("id", v.productId)
    .single();
  if (!product) return actionError("NOT_FOUND", "Listing not found.");
  const p = product as {
    id: string;
    owner_id: string;
    status: string;
    title: string;
    price_per_day: number;
    security_deposit: number;
    min_rental_days: number;
    max_rental_days: number | null;
  };

  if (p.owner_id === user.id) {
    return actionError("VALIDATION_ERROR", "You can't book your own listing.");
  }
  if (p.status !== "available") {
    return actionError("INVALID_TRANSITION", "This listing isn't available right now.");
  }

  const days = daysBetween(v.startDate, v.endDate);
  if (days < p.min_rental_days) {
    return actionError("VALIDATION_ERROR", `Minimum rental is ${p.min_rental_days} day(s).`);
  }
  if (p.max_rental_days && days > p.max_rental_days) {
    return actionError("VALIDATION_ERROR", `Maximum rental is ${p.max_rental_days} day(s).`);
  }

  const { data: overlapping } = await supabase
    .from("availability_blocks")
    .select("id")
    .eq("product_id", v.productId)
    .lte("start_date", v.endDate)
    .gte("end_date", v.startDate)
    .limit(1);
  if (overlapping && overlapping.length > 0) {
    return actionError("DATE_CONFLICT", "Those dates are no longer available.");
  }

  const subtotal = Math.round(p.price_per_day * days * 100) / 100;

  const { data: bookingData, error } = await supabase
    .from("bookings")
    .insert({
      product_id: v.productId,
      customer_id: user.id,
      owner_id: p.owner_id,
      start_date: v.startDate,
      end_date: v.endDate,
      status: "requested",
      subtotal_amount: subtotal,
      deposit_amount: p.security_deposit,
    })
    .select("id")
    .single();
  if (error || !bookingData) {
    return actionError("UNKNOWN", error?.message ?? "Could not submit request.");
  }
  const newBookingId = (bookingData as { id: string }).id;

  const customerName = await getFullName(supabase, user.id);
  await notify(p.owner_id, "booking_requested", {
    customerName,
    productTitle: p.title,
    href: `/bookings/${newBookingId}`,
  });

  revalidatePath("/bookings");
  revalidatePath("/owner/bookings");
  return actionOk({ bookingId: newBookingId });
}

async function loadBookingForActor(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, booking: null };

  const { data } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
  return { supabase, user, booking: data as BookingRow | null };
}

export async function acceptBooking(bookingId: string): Promise<ActionResult> {
  const { supabase, user, booking } = await loadBookingForActor(bookingId);
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");
  if (booking.owner_id !== user.id) return actionError("NOT_OWNER", "Not your listing.");
  if (booking.status !== "requested") {
    return actionError("INVALID_TRANSITION", "This request was already handled.");
  }

  const serviceRole = createServiceRoleClient();
  const { data: setting } = await serviceRole
    .from("platform_settings")
    .select("value")
    .eq("key", "platform_fee_rate")
    .maybeSingle();
  const feeRate = Number((setting as { value?: number } | null)?.value ?? DEFAULT_PLATFORM_FEE_RATE);
  const feeAmount = Math.round(booking.subtotal_amount * feeRate * 100) / 100;
  const payout = Math.round((booking.subtotal_amount - feeAmount) * 100) / 100;

  const { error: blockError } = await supabase.from("availability_blocks").insert({
    product_id: booking.product_id,
    start_date: booking.start_date,
    end_date: booking.end_date,
    reason: "booking",
    booking_id: booking.id,
  });
  if (blockError) {
    // Most likely the EXCLUDE constraint — another booking already claimed an overlapping range.
    return actionError("DATE_CONFLICT", "Those dates were just booked by someone else.");
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "accepted",
      platform_fee_rate: feeRate,
      platform_fee_amount: feeAmount,
      owner_payout_amount: payout,
      responded_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) return actionError("UNKNOWN", error.message);

  const rentalCharge = await paymentProvider.chargeRental(bookingId, booking.subtotal_amount);
  const depositHold = await paymentProvider.holdDeposit(bookingId, booking.deposit_amount);
  await serviceRole.from("payments").insert([
    {
      booking_id: bookingId,
      type: "rental_charge",
      amount: booking.subtotal_amount,
      status: "succeeded",
      provider: "mock",
      provider_reference: rentalCharge.providerReference,
    },
    {
      booking_id: bookingId,
      type: "deposit_hold",
      amount: booking.deposit_amount,
      status: "succeeded",
      provider: "mock",
      provider_reference: depositHold.providerReference,
    },
  ]);

  const productTitle = await getProductTitle(supabase, booking.product_id);
  await notify(booking.customer_id, "booking_accepted", {
    productTitle,
    href: `/bookings/${bookingId}`,
  });

  revalidatePath("/bookings");
  revalidatePath("/owner/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  return actionOk(undefined);
}

export async function rejectBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const { supabase, user, booking } = await loadBookingForActor(bookingId);
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");
  if (booking.owner_id !== user.id) return actionError("NOT_OWNER", "Not your listing.");
  if (booking.status !== "requested") {
    return actionError("INVALID_TRANSITION", "This request was already handled.");
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "rejected",
      cancellation_reason: reason || null,
      responded_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) return actionError("UNKNOWN", error.message);

  const productTitle = await getProductTitle(supabase, booking.product_id);
  await notify(booking.customer_id, "booking_rejected", {
    productTitle,
    href: `/bookings/${bookingId}`,
  });

  revalidatePath("/bookings");
  revalidatePath("/owner/bookings");
  return actionOk(undefined);
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const { supabase, user, booking } = await loadBookingForActor(bookingId);
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");

  const isCustomer = booking.customer_id === user.id;
  const isOwner = booking.owner_id === user.id;
  if (!isCustomer && !isOwner) return actionError("NOT_OWNER", "You're not part of this booking.");
  if (!["requested", "accepted"].includes(booking.status)) {
    return actionError("INVALID_TRANSITION", "This booking can no longer be cancelled.");
  }

  const serviceRole = createServiceRoleClient();
  const wasAccepted = booking.status === "accepted";
  const hoursUntilStart = (new Date(booking.start_date).getTime() - Date.now()) / 3_600_000;
  const retainFee =
    isCustomer && wasAccepted && hoursUntilStart < CANCELLATION_FREE_WINDOW_HOURS;

  await supabase.from("availability_blocks").delete().eq("booking_id", bookingId);

  if (wasAccepted) {
    const feeAmount = booking.platform_fee_amount ?? 0;
    const refundAmount = retainFee
      ? Math.round((booking.subtotal_amount - feeAmount) * 100) / 100
      : booking.subtotal_amount;

    const payments = [];
    if (refundAmount > 0) {
      const refund = await paymentProvider.refundRental(bookingId, refundAmount);
      payments.push({
        booking_id: bookingId,
        type: "refund",
        amount: refundAmount,
        status: "succeeded",
        provider: "mock",
        provider_reference: refund.providerReference,
      });
    }
    if (booking.deposit_amount > 0) {
      const depositRelease = await paymentProvider.releaseDeposit(bookingId, booking.deposit_amount);
      payments.push({
        booking_id: bookingId,
        type: "deposit_release",
        amount: booking.deposit_amount,
        status: "succeeded",
        provider: "mock",
        provider_reference: depositRelease.providerReference,
      });
    }
    if (payments.length > 0) {
      await serviceRole.from("payments").insert(payments);
    }

    if (isOwner) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("cancellation_count")
        .eq("id", user.id)
        .single();
      await supabase
        .from("profiles")
        .update({
          cancellation_count:
            ((ownerProfile as { cancellation_count?: number } | null)?.cancellation_count ?? 0) + 1,
        })
        .eq("id", user.id);
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_by: isOwner ? "owner" : "customer",
      cancellation_reason: reason || null,
    })
    .eq("id", bookingId);
  if (error) return actionError("UNKNOWN", error.message);

  const productTitle = await getProductTitle(supabase, booking.product_id);
  const otherParty = isOwner ? booking.customer_id : booking.owner_id;
  await notify(otherParty, "booking_cancelled", { productTitle, href: `/bookings/${bookingId}` });

  revalidatePath("/bookings");
  revalidatePath("/owner/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  return actionOk(undefined);
}

export async function markReturned(
  bookingId: string,
  damageReported: boolean,
): Promise<ActionResult> {
  const { supabase, user, booking } = await loadBookingForActor(bookingId);
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");
  if (booking.customer_id !== user.id && booking.owner_id !== user.id) {
    return actionError("NOT_OWNER", "You're not part of this booking.");
  }
  if (!["accepted", "active"].includes(booking.status)) {
    return actionError("INVALID_TRANSITION", "This booking isn't awaiting return.");
  }

  if (damageReported) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "disputed" })
      .eq("id", bookingId);
    if (error) return actionError("UNKNOWN", error.message);

    const productTitle = await getProductTitle(supabase, booking.product_id);
    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    const recipients = [
      booking.customer_id,
      booking.owner_id,
      ...((admins ?? []) as { id: string }[]).map((a) => a.id),
    ];
    await Promise.all(
      recipients.map((userId) =>
        notify(userId, "dispute_opened", {
          productTitle,
          href: recipients.slice(0, 2).includes(userId) ? `/bookings/${bookingId}` : "/admin/bookings",
        }),
      ),
    );

    revalidatePath(`/bookings/${bookingId}`);
    return actionOk(undefined);
  }

  const serviceRole = createServiceRoleClient();
  if (booking.deposit_amount > 0) {
    const release = await paymentProvider.releaseDeposit(bookingId, booking.deposit_amount);
    await serviceRole.from("payments").insert({
      booking_id: bookingId,
      type: "deposit_release",
      amount: booking.deposit_amount,
      status: "succeeded",
      provider: "mock",
      provider_reference: release.providerReference,
    });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", bookingId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/bookings");
  revalidatePath("/owner/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  return actionOk(undefined);
}
