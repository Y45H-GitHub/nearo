import { createClient } from "@/lib/supabase/server";

export async function getWishlistedProductIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);

  return new Set((data ?? []).map((row) => (row as { product_id: string }).product_id));
}

export async function getWishlistProducts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select(
      "product_id, products (id, title, price_per_day, city, cover_image_url, status)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((row) => (row as unknown as { products: Record<string, unknown> | null }).products)
    .filter((p): p is Record<string, unknown> => Boolean(p))
    .map((p) => ({
      id: p.id as string,
      title: p.title as string,
      price_per_day: p.price_per_day as number,
      city: p.city as string,
      cover_image_url: p.cover_image_url as string | null,
      status: p.status as string,
    }));
}
