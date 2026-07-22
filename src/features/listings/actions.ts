"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listingInputSchema, type ListingInput } from "@/lib/validation/listing";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

async function requireVerifiedOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, verified: false } as const;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_verified_at")
    .eq("id", user.id)
    .single();
  const verified =
    Boolean(user.email_confirmed_at) &&
    Boolean((profile as { phone_verified_at?: string | null } | null)?.phone_verified_at);
  return { supabase, user, verified } as const;
}

export async function createListing(
  input: ListingInput,
  publish: boolean,
): Promise<ActionResult<{ productId: string }>> {
  const { supabase, user, verified } = await requireVerifiedOwner();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!verified) {
    return actionError("UNVERIFIED", "Verify your email and phone before listing an item.");
  }

  const parsed = listingInputSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }
  const v = parsed.data;
  const coverImage = v.images.find((i) => i.isCover)!;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      owner_id: user.id,
      title: v.title,
      description: v.description,
      category_id: v.categoryId,
      subcategory_id: v.subcategoryId || null,
      brand: v.brand || null,
      model: v.model || null,
      condition: v.condition,
      price_per_day: v.pricePerDay,
      security_deposit: v.securityDeposit,
      min_rental_days: v.minRentalDays,
      max_rental_days: v.maxRentalDays || null,
      pickup_available: v.pickupAvailable,
      delivery_available: v.deliveryAvailable,
      delivery_radius_km: v.deliveryRadiusKm || null,
      address_text: v.addressText,
      city: v.city,
      lat: v.lat,
      lng: v.lng,
      visibility_radius_km: v.visibilityRadiusKm,
      status: publish ? "available" : "draft",
      cover_image_url: coverImage.url,
      published_at: publish ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !product) {
    return actionError("UNKNOWN", error?.message ?? "Could not create listing.");
  }
  const productId = (product as { id: string }).id;

  const { error: imagesError } = await supabase.from("product_images").insert(
    v.images.map((img) => ({
      product_id: productId,
      url: img.url,
      sort_order: img.sortOrder,
      is_cover: img.isCover,
    })),
  );
  if (imagesError) {
    return actionError("UNKNOWN", imagesError.message);
  }

  if (v.availabilityBlocks.length > 0) {
    const { error: blocksError } = await supabase.from("availability_blocks").insert(
      v.availabilityBlocks.map((b) => ({
        product_id: productId,
        start_date: b.startDate,
        end_date: b.endDate,
        reason: "owner_block",
      })),
    );
    if (blocksError) {
      return actionError("UNKNOWN", blocksError.message);
    }
  }

  revalidatePath("/owner/listings");
  return actionOk({ productId });
}

export async function updateListing(
  productId: string,
  input: ListingInput,
): Promise<ActionResult> {
  const { supabase, user } = await requireVerifiedOwner();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");

  const { data: existing } = await supabase
    .from("products")
    .select("id, owner_id")
    .eq("id", productId)
    .single();
  if (!existing || (existing as { owner_id: string }).owner_id !== user.id) {
    return actionError("NOT_OWNER", "You don't own this listing.");
  }

  const parsed = listingInputSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }
  const v = parsed.data;
  const coverImage = v.images.find((i) => i.isCover)!;

  const { error } = await supabase
    .from("products")
    .update({
      title: v.title,
      description: v.description,
      category_id: v.categoryId,
      subcategory_id: v.subcategoryId || null,
      brand: v.brand || null,
      model: v.model || null,
      condition: v.condition,
      price_per_day: v.pricePerDay,
      security_deposit: v.securityDeposit,
      min_rental_days: v.minRentalDays,
      max_rental_days: v.maxRentalDays || null,
      pickup_available: v.pickupAvailable,
      delivery_available: v.deliveryAvailable,
      delivery_radius_km: v.deliveryRadiusKm || null,
      address_text: v.addressText,
      city: v.city,
      lat: v.lat,
      lng: v.lng,
      visibility_radius_km: v.visibilityRadiusKm,
      cover_image_url: coverImage.url,
    })
    .eq("id", productId);
  if (error) return actionError("UNKNOWN", error.message);

  await supabase.from("product_images").delete().eq("product_id", productId);
  const { error: imagesError } = await supabase.from("product_images").insert(
    v.images.map((img) => ({
      product_id: productId,
      url: img.url,
      sort_order: img.sortOrder,
      is_cover: img.isCover,
    })),
  );
  if (imagesError) return actionError("UNKNOWN", imagesError.message);

  revalidatePath("/owner/listings");
  revalidatePath(`/listing/${productId}`);
  return actionOk(undefined);
}

async function setListingStatus(
  productId: string,
  status: "available" | "hidden",
  extra: Record<string, unknown> = {},
): Promise<ActionResult> {
  const { supabase, user } = await requireVerifiedOwner();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");

  const { data: existing } = await supabase
    .from("products")
    .select("id, owner_id, status")
    .eq("id", productId)
    .single();
  if (!existing || (existing as { owner_id: string }).owner_id !== user.id) {
    return actionError("NOT_OWNER", "You don't own this listing.");
  }

  const { error } = await supabase
    .from("products")
    .update({ status, ...extra })
    .eq("id", productId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/owner/listings");
  return actionOk(undefined);
}

export async function publishListing(productId: string): Promise<ActionResult> {
  return setListingStatus(productId, "available", { published_at: new Date().toISOString() });
}

export async function pauseListing(productId: string): Promise<ActionResult> {
  return setListingStatus(productId, "hidden");
}

export async function resumeListing(productId: string): Promise<ActionResult> {
  return setListingStatus(productId, "available");
}

export async function deleteListing(productId: string): Promise<ActionResult> {
  const { supabase, user } = await requireVerifiedOwner();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");

  const { data: existing } = await supabase
    .from("products")
    .select("id, owner_id")
    .eq("id", productId)
    .single();
  if (!existing || (existing as { owner_id: string }).owner_id !== user.id) {
    return actionError("NOT_OWNER", "You don't own this listing.");
  }

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .in("status", ["requested", "accepted", "active"]);
  if (count && count > 0) {
    return actionError(
      "INVALID_TRANSITION",
      "This listing has an active or pending booking — cancel or complete it first.",
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/owner/listings");
  return actionOk(undefined);
}
