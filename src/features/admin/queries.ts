import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Every query here uses the service-role client, not the RLS-bound session
 * client that the rest of the app uses for reads (per ADR 0007). Two reasons:
 * the Users list needs auth.users.email, which PostgREST never exposes to a
 * session-bound client regardless of RLS; and every /admin/* route is already
 * gated to admins only by src/lib/supabase/middleware.ts, so there's no
 * RLS boundary left to preserve here.
 */

export type AdminSnapshot = {
  newUsers7d: number;
  newListings7d: number;
  bookingsInFlight: number;
  openReports: number;
  recentBookings: { id: string; product_title: string; status: string; created_at: string }[];
  recentReports: { id: string; reason: string; status: string; created_at: string }[];
};

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = createServiceRoleClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [{ count: newUsers7d }, { count: newListings7d }, { count: bookingsInFlight }, { count: openReports }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabase.from("products").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["requested", "accepted", "active"]),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, created_at, products (title)")
    .order("created_at", { ascending: false })
    .limit(10);
  const recentBookings = ((bookings ?? []) as unknown as {
    id: string;
    status: string;
    created_at: string;
    products: { title: string } | null;
  }[]).map((b) => ({
    id: b.id,
    product_title: b.products?.title ?? "Listing",
    status: b.status,
    created_at: b.created_at,
  }));

  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    newUsers7d: newUsers7d ?? 0,
    newListings7d: newListings7d ?? 0,
    bookingsInFlight: bookingsInFlight ?? 0,
    openReports: openReports ?? 0,
    recentBookings,
    recentReports: (reports ?? []) as { id: string; reason: string; status: string; created_at: string }[],
  };
}

export type AdminUserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone_verified_at: string | null;
  role: string;
  is_suspended: boolean;
  created_at: string;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createServiceRoleClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone_verified_at, role, is_suspended, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (profiles ?? []) as {
    id: string;
    full_name: string;
    phone_verified_at: string | null;
    role: string;
    is_suspended: boolean;
    created_at: string;
  }[];
  if (rows.length === 0) return [];

  const { data: usersPage } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map(usersPage.users.map((u) => [u.id, u.email ?? null]));

  return rows.map((r) => ({ ...r, email: emailById.get(r.id) ?? null }));
}

export type AdminListingRow = {
  id: string;
  title: string;
  status: string;
  price_per_day: number;
  created_at: string;
  owner_name: string;
};

export async function getAdminListings(): Promise<AdminListingRow[]> {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("products")
    .select("id, title, status, price_per_day, created_at, owner_id")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as {
    id: string;
    title: string;
    status: string;
    price_per_day: number;
    created_at: string;
    owner_id: string;
  }[];
  if (rows.length === 0) return [];

  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];
  const { data: owners } = await supabase.from("profiles").select("id, full_name").in("id", ownerIds);
  const nameById = new Map((owners ?? []).map((o) => [(o as { id: string }).id, (o as { full_name: string }).full_name]));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    price_per_day: r.price_per_day,
    created_at: r.created_at,
    owner_name: nameById.get(r.owner_id) ?? "Unknown",
  }));
}

export type AdminBookingRow = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  admin_notes: string | null;
  product_title: string;
  customer_name: string;
  owner_name: string;
};

export async function getAdminBookings(): Promise<AdminBookingRow[]> {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("bookings")
    .select("id, status, start_date, end_date, admin_notes, customer_id, owner_id, products (title)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    admin_notes: string | null;
    customer_id: string;
    owner_id: string;
    products: { title: string } | null;
  }[];
  if (rows.length === 0) return [];

  const profileIds = [...new Set(rows.flatMap((r) => [r.customer_id, r.owner_id]))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", profileIds);
  const nameById = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { full_name: string }).full_name]),
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    start_date: r.start_date,
    end_date: r.end_date,
    admin_notes: r.admin_notes,
    product_title: r.products?.title ?? "Listing",
    customer_name: nameById.get(r.customer_id) ?? "Unknown",
    owner_name: nameById.get(r.owner_id) ?? "Unknown",
  }));
}

export type AdminReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_name: string;
};

export async function getAdminReports(): Promise<AdminReportRow[]> {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, description, status, created_at, reporter_id")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as {
    id: string;
    target_type: string;
    target_id: string;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
    reporter_id: string;
  }[];
  if (rows.length === 0) return [];

  const reporterIds = [...new Set(rows.map((r) => r.reporter_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", reporterIds);
  const nameById = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { full_name: string }).full_name]),
  );

  return rows.map((r) => ({
    id: r.id,
    target_type: r.target_type,
    target_id: r.target_id,
    reason: r.reason,
    description: r.description,
    status: r.status,
    created_at: r.created_at,
    reporter_name: nameById.get(r.reporter_id) ?? "Unknown",
  }));
}

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, icon, parent_id, sort_order, is_active")
    .order("sort_order");
  return (data ?? []) as AdminCategoryRow[];
}

export type AdminAnalytics = {
  days: string[];
  signups: number[];
  listings: number[];
  bookings: number[];
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = createServiceRoleClient();
  const since = new Date(Date.now() - 13 * 86_400_000);
  since.setUTCHours(0, 0, 0, 0);

  const [{ data: profiles }, { data: products }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
    supabase.from("products").select("created_at").gte("created_at", since.toISOString()),
    supabase.from("bookings").select("created_at").gte("created_at", since.toISOString()),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000);
    return d.toISOString().slice(0, 10);
  });

  const bucket = (rows: { created_at: string }[] | null) => {
    const counts = new Map(days.map((d) => [d, 0]));
    for (const row of rows ?? []) {
      const day = row.created_at.slice(0, 10);
      if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return days.map((d) => counts.get(d) ?? 0);
  };

  return {
    days,
    signups: bucket(profiles as { created_at: string }[] | null),
    listings: bucket(products as { created_at: string }[] | null),
    bookings: bucket(bookings as { created_at: string }[] | null),
  };
}
