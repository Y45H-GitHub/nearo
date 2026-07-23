"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { paymentProvider } from "@/lib/payments/mock-provider";
import { categoryInputSchema, resolveDisputeSchema, type CategoryInput } from "@/lib/validation/admin";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";
  return { userId: isAdmin ? user.id : null };
}

export async function suspendUser(userId: string, suspended: boolean): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("profiles")
    .update({ is_suspended: suspended, suspended_at: suspended ? new Date().toISOString() : null })
    .eq("id", userId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/users");
  return actionOk(undefined);
}

export async function hideListing(productId: string, hidden: boolean): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("products")
    .update({ status: hidden ? "hidden" : "available" })
    .eq("id", productId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/listings");
  return actionOk(undefined);
}

export async function resolveReport(
  reportId: string,
  outcome: "resolved" | "dismissed",
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("reports")
    .update({ status: outcome, resolved_by: adminId, resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/reports");
  return actionOk(undefined);
}

export async function resolveDispute(input: {
  bookingId: string;
  outcome: "returned" | "cancelled";
  notes: string;
}): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const parsed = resolveDisputeSchema.safeParse(input);
  if (!parsed.success) return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  const v = parsed.data;

  const serviceRole = createServiceRoleClient();
  const { data: booking } = await serviceRole
    .from("bookings")
    .select("id, status, deposit_amount")
    .eq("id", v.bookingId)
    .single();
  if (!booking) return actionError("NOT_FOUND", "Booking not found.");
  const b = booking as { id: string; status: string; deposit_amount: number };
  if (b.status !== "disputed") {
    return actionError("INVALID_TRANSITION", "This booking isn't under dispute.");
  }

  // No automated partial-forfeiture in MVP (business-rules.md § Cancellation &
  // Deposit) — the deposit is always released in full; the admin's notes are
  // the actual record of how the dispute was really settled.
  if (b.deposit_amount > 0) {
    const release = await paymentProvider.releaseDeposit(v.bookingId, b.deposit_amount);
    await serviceRole.from("payments").insert({
      booking_id: v.bookingId,
      type: "deposit_release",
      amount: b.deposit_amount,
      status: "succeeded",
      provider: "mock",
      provider_reference: release.providerReference,
    });
  }

  const { error } = await serviceRole
    .from("bookings")
    .update({
      status: v.outcome,
      admin_notes: v.notes,
      resolved_by: adminId,
      returned_at: v.outcome === "returned" ? new Date().toISOString() : null,
    })
    .eq("id", v.bookingId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/bookings");
  revalidatePath(`/bookings/${v.bookingId}`);
  return actionOk(undefined);
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  const v = parsed.data;

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.from("categories").insert({
    name: v.name,
    slug: v.slug,
    parent_id: v.parentId || null,
    icon: v.icon || null,
    sort_order: v.sortOrder,
  });
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/categories");
  return actionOk(undefined);
}

export async function updateCategory(categoryId: string, input: CategoryInput): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  const v = parsed.data;

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("categories")
    .update({
      name: v.name,
      slug: v.slug,
      parent_id: v.parentId || null,
      icon: v.icon || null,
      sort_order: v.sortOrder,
    })
    .eq("id", categoryId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/categories");
  return actionOk(undefined);
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();
  if (!adminId) return actionError("FORBIDDEN", "Admins only.");

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.from("categories").update({ is_active: isActive }).eq("id", categoryId);
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/admin/categories");
  return actionOk(undefined);
}
