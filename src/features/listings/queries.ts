import { createClient } from "@/lib/supabase/server";
import type { ProductCondition, ProductStatus } from "@/types/domain";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
};

export async function getCategoryTree() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, icon, parent_id")
    .eq("is_active", true)
    .order("sort_order");

  const rows = (data ?? []) as CategoryRow[];
  const topLevel = rows.filter((c) => !c.parent_id);
  const children = (parentId: string) =>
    rows.filter((c) => c.parent_id === parentId);

  return { rows, topLevel, children };
}

export type ProductImageRow = {
  id: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
};

export type ProductRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string | null;
  brand: string | null;
  model: string | null;
  condition: ProductCondition;
  price_per_day: number;
  security_deposit: number;
  min_rental_days: number;
  max_rental_days: number | null;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_radius_km: number | null;
  address_text: string;
  city: string;
  lat: number;
  lng: number;
  visibility_radius_km: number;
  status: ProductStatus;
  cover_image_url: string | null;
  created_at: string;
};

export async function getOwnerListings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("products")
    .select(
      "id, title, status, price_per_day, cover_image_url, city, created_at",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Pick<
    ProductRow,
    "id" | "title" | "status" | "price_per_day" | "cover_image_url" | "city" | "created_at"
  >[];
}

export async function getProductForEdit(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("owner_id", user.id)
    .single();
  if (!product) return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("id, url, sort_order, is_cover")
    .eq("product_id", productId)
    .order("sort_order");

  return {
    product: product as ProductRow,
    images: (images ?? []) as ProductImageRow[],
  };
}

export async function getProductDetail(productId: string) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (!product) return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("id, url, sort_order, is_cover")
    .eq("product_id", productId)
    .order("sort_order");

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, phone_verified_at, rating_avg, rating_count, created_at")
    .eq("id", (product as ProductRow).owner_id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    product: product as ProductRow,
    images: (images ?? []) as ProductImageRow[],
    owner: owner as
      | {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone_verified_at: string | null;
          rating_avg: number;
          rating_count: number;
          created_at: string;
        }
      | null,
    isOwner: user?.id === (product as ProductRow).owner_id,
  };
}
