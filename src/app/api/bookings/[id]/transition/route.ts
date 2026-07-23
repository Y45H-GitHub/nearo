import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { paymentProvider } from "@/lib/payments/mock-provider";
import { notify } from "@/lib/notifications/notify";

/**
 * Lazy, client-triggered status transition per api-design.md § 3 — no cron
 * job in MVP. Called once when a booking detail/list page mounts.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (!booking) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const b = booking as {
    id: string;
    product_id: string;
    customer_id: string;
    owner_id: string;
    status: string;
    start_date: string;
    end_date: string;
    deposit_amount: number;
  };
  if (b.customer_id !== user.id && b.owner_id !== user.id) {
    return NextResponse.json({ error: "NOT_OWNER" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  if (b.status === "accepted" && b.start_date <= today) {
    await supabase
      .from("bookings")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ status: "active" });
  }

  // Best-effort "starts tomorrow" reminder — there's no cron in MVP, so this
  // only fires when someone happens to load the booking page the day before.
  // Guarded so repeat page loads on that same day don't re-notify.
  if (b.status === "accepted" && b.start_date === tomorrow) {
    const serviceRole = createServiceRoleClient();
    const { data: already } = await serviceRole
      .from("notifications")
      .select("id")
      .eq("template_key", "rental_starting_soon")
      .contains("payload", { bookingId: id })
      .limit(1);
    if (!already || already.length === 0) {
      const { data: prod } = await supabase.from("products").select("title").eq("id", b.product_id).single();
      const productTitle = (prod as { title?: string } | null)?.title || "your rental";
      await notify(b.customer_id, "rental_starting_soon", { productTitle, bookingId: id, href: `/bookings/${id}` });
      await notify(b.owner_id, "rental_starting_soon", { productTitle, bookingId: id, href: `/bookings/${id}` });
    }
  }

  if (b.status === "active" && b.end_date < today) {
    const serviceRole = createServiceRoleClient();
    if (b.deposit_amount > 0) {
      const release = await paymentProvider.releaseDeposit(id, b.deposit_amount);
      await serviceRole.from("payments").insert({
        booking_id: id,
        type: "deposit_release",
        amount: b.deposit_amount,
        status: "succeeded",
        provider: "mock",
        provider_reference: release.providerReference,
      });
    }
    await supabase
      .from("bookings")
      .update({ status: "returned", returned_at: new Date().toISOString() })
      .eq("id", id);

    const { data: prod } = await supabase.from("products").select("title").eq("id", b.product_id).single();
    const productTitle = (prod as { title?: string } | null)?.title || "your rental";
    await notify(b.customer_id, "rental_return_due", { productTitle, href: `/bookings/${id}` });
    await notify(b.owner_id, "rental_return_due", { productTitle, href: `/bookings/${id}` });

    return NextResponse.json({ status: "returned" });
  }

  return NextResponse.json({ status: b.status });
}
