"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CategoryRow } from "@/features/listings/queries";
import type { ProductCondition } from "@/types/domain";

const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "distance", label: "Distance" },
];

export function CategoryChips({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  function go(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => go(null)}
        className={cn(
          "rounded-full border px-3 py-1 text-sm",
          !active ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground",
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => go(c.slug)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            active === c.slug ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground",
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function ExploreFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [locating, setLocating] = useState(false);
  const activeConditions = new Set(searchParams.getAll("condition"));
  const radiusKm = searchParams.get("radiusKm") ?? "5";
  const hasLocation = searchParams.has("lat");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`/explore?${params.toString()}`);
  }

  function applyPrice() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  function toggleCondition(value: string) {
    updateParams((params) => {
      const conditions = new Set(params.getAll("condition"));
      if (conditions.has(value)) conditions.delete(value);
      else conditions.add(value);
      params.delete("condition");
      conditions.forEach((c) => params.append("condition", c));
    });
  }

  function useNearMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateParams((params) => {
          params.set("lat", String(pos.coords.latitude));
          params.set("lng", String(pos.coords.longitude));
        });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Price per day (₹)</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
          />
        </div>
      </div>

      <div>
        <Label>Condition</Label>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={activeConditions.has(c.value)}
                onChange={() => toggleCondition(c.value)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Distance</Label>
        <div className="mt-1.5 flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={useNearMe} disabled={locating}>
            {locating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
            {hasLocation ? "Location set" : "Search near me"}
          </Button>
          {hasLocation && (
            <select
              value={radiusKm}
              onChange={(e) => updateParams((params) => params.set("radiusKm", e.target.value))}
              className="h-8 w-fit rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
            >
              {[5, 10, 25, 50].map((km) => (
                <option key={km} value={km}>
                  Within {km} km
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";

  return (
    <select
      value={sort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        router.push(`/explore?${params.toString()}`);
      }}
      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
