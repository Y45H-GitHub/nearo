import { createClient } from "@/lib/supabase/server";
import { distanceKm } from "@/lib/geo";
import { DEFAULT_SEARCH_RADIUS_KM } from "@/config/constants";
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
  view_count: number;
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

export type ExploreFilters = {
  q?: string;
  category?: string; // category slug — matches either category_id or subcategory_id
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  minRating?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  availableFrom?: string;
  availableTo?: string;
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "distance";
};

export type ExploreListing = Pick<
  ProductRow,
  "id" | "title" | "price_per_day" | "city" | "cover_image_url" | "lat" | "lng" | "created_at" | "view_count"
> & { distanceKm: number | null };

export async function getExploreListings(filters: ExploreFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, title, price_per_day, city, cover_image_url, lat, lng, created_at, view_count, owner_id",
    )
    .eq("status", "available");

  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    const categoryId = (cat as { id: string } | null)?.id;
    if (categoryId) {
      query = query.or(`category_id.eq.${categoryId},subcategory_id.eq.${categoryId}`);
    }
  }
  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }
  if (filters.minPrice !== undefined) query = query.gte("price_per_day", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_per_day", filters.maxPrice);
  if (filters.condition && filters.condition.length > 0) {
    query = query.in("condition", filters.condition);
  }

  query = query.limit(60);
  if (filters.sort === "price_asc") query = query.order("price_per_day", { ascending: true });
  else if (filters.sort === "price_desc") query = query.order("price_per_day", { ascending: false });
  else if (filters.sort === "popular") query = query.order("view_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  let listings = (data ?? []) as (ExploreListing & { owner_id: string })[];

  if (filters.minRating) {
    const ownerIds = [...new Set(listings.map((l) => l.owner_id))];
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, rating_avg")
      .in("id", ownerIds);
    const ratingByOwner = new Map(
      (owners ?? []).map((o) => [(o as { id: string }).id, (o as { rating_avg: number }).rating_avg]),
    );
    listings = listings.filter((l) => (ratingByOwner.get(l.owner_id) ?? 0) >= filters.minRating!);
  }

  if (filters.availableFrom && filters.availableTo) {
    const ids = listings.map((l) => l.id);
    const { data: blocks } = await supabase
      .from("availability_blocks")
      .select("product_id, start_date, end_date")
      .in("product_id", ids)
      .lte("start_date", filters.availableTo)
      .gte("end_date", filters.availableFrom);
    const blockedIds = new Set(
      (blocks ?? []).map((b) => (b as { product_id: string }).product_id),
    );
    listings = listings.filter((l) => !blockedIds.has(l.id));
  }

  const withDistance: ExploreListing[] = listings.map((l) => ({
    ...l,
    distanceKm:
      filters.lat !== undefined && filters.lng !== undefined
        ? distanceKm(filters.lat, filters.lng, l.lat, l.lng)
        : null,
  }));

  const radiusKm = filters.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM;
  const filtered =
    filters.lat !== undefined && filters.lng !== undefined
      ? withDistance.filter((l) => l.distanceKm !== null && l.distanceKm <= radiusKm)
      : withDistance;

  if (filters.sort === "distance" || (filters.lat !== undefined && !filters.sort)) {
    filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return filtered;
}
