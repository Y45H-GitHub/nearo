"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createListing, updateListing } from "@/features/listings/actions";
import { listingInputSchema, type ListingInput } from "@/lib/validation/listing";
import type { CategoryRow } from "@/features/listings/queries";
import type { ProductCondition } from "@/types/domain";

type WizardImage = { url: string; isCover: boolean; sortOrder: number; tempId: string };
type AvailabilityBlock = { startDate: string; endDate: string };

type WizardState = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  model: string;
  condition: ProductCondition;
  pricePerDay: string;
  securityDeposit: string;
  minRentalDays: string;
  maxRentalDays: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryRadiusKm: string;
  addressText: string;
  city: string;
  lat: number | null;
  lng: number | null;
  visibilityRadiusKm: string;
  images: WizardImage[];
  availabilityBlocks: AvailabilityBlock[];
};

const STEPS = [
  "Basics",
  "Details",
  "Pricing",
  "Location & delivery",
  "Photos",
  "Availability",
  "Review",
] as const;

const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

function emptyState(launchCity: string): WizardState {
  return {
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    model: "",
    condition: "good",
    pricePerDay: "",
    securityDeposit: "0",
    minRentalDays: "1",
    maxRentalDays: "",
    pickupAvailable: true,
    deliveryAvailable: false,
    deliveryRadiusKm: "",
    addressText: "",
    city: launchCity,
    lat: null,
    lng: null,
    visibilityRadiusKm: "5",
    images: [],
    availabilityBlocks: [],
  };
}

export function ListingWizard({
  mode,
  productId,
  categories,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  /** Flat list — functions can't cross the server/client boundary, so
   * topLevel/children are derived locally instead of passed in. */
  categories: CategoryRow[];
  initial?: WizardState;
}) {
  const router = useRouter();
  const launchCity = process.env.NEXT_PUBLIC_LAUNCH_CITY || "";
  const topLevelCategories = categories.filter((c) => !c.parent_id);
  const childCategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardState>(initial ?? emptyState(launchCity));
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("lat", pos.coords.latitude);
        set("lng", pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 },
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > 10) {
      setError("You can upload up to 10 photos.");
      return;
    }
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in again to upload photos.");
      setUploading(false);
      return;
    }

    const uploaded: WizardImage[] = [];
    for (const file of Array.from(files)) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      uploaded.push({
        url: data.publicUrl,
        isCover: false,
        sortOrder: form.images.length + uploaded.length,
        tempId: path,
      });
    }

    setForm((prev) => {
      const images = [...prev.images, ...uploaded];
      if (images.length > 0 && !images.some((i) => i.isCover)) {
        images[0].isCover = true;
      }
      return { ...prev, images };
    });
    setUploading(false);
  }

  function setCover(tempId: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((i) => ({ ...i, isCover: i.tempId === tempId })),
    }));
  }

  function removeImage(tempId: string) {
    setForm((prev) => {
      const images = prev.images.filter((i) => i.tempId !== tempId);
      if (images.length > 0 && !images.some((i) => i.isCover)) {
        images[0].isCover = true;
      }
      return { ...prev, images };
    });
  }

  function addAvailabilityBlock(startDate: string, endDate: string) {
    if (!startDate || !endDate) return;
    setForm((prev) => ({
      ...prev,
      availabilityBlocks: [...prev.availabilityBlocks, { startDate, endDate }],
    }));
  }

  function removeAvailabilityBlock(index: number) {
    setForm((prev) => ({
      ...prev,
      availabilityBlocks: prev.availabilityBlocks.filter((_, i) => i !== index),
    }));
  }

  function toInput(): ListingInput | null {
    const input = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      brand: form.brand,
      model: form.model,
      condition: form.condition,
      pricePerDay: Number(form.pricePerDay),
      securityDeposit: Number(form.securityDeposit || 0),
      minRentalDays: Number(form.minRentalDays || 1),
      maxRentalDays: form.maxRentalDays ? Number(form.maxRentalDays) : null,
      pickupAvailable: form.pickupAvailable,
      deliveryAvailable: form.deliveryAvailable,
      deliveryRadiusKm: form.deliveryRadiusKm ? Number(form.deliveryRadiusKm) : null,
      addressText: form.addressText,
      city: form.city,
      lat: form.lat ?? 0,
      lng: form.lng ?? 0,
      visibilityRadiusKm: Number(form.visibilityRadiusKm || 5),
      images: form.images.map(({ url, isCover, sortOrder }) => ({ url, isCover, sortOrder })),
      availabilityBlocks: form.availabilityBlocks,
    };
    const parsed = listingInputSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return null;
    }
    return parsed.data;
  }

  function submit(publish: boolean) {
    const input = toInput();
    if (!input) return;
    setError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && productId
          ? await updateListing(productId, input)
          : await createListing(input, publish);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.push("/owner/listings");
    });
  }

  const stepValid = (() => {
    switch (step) {
      case 0:
        return (
          form.title.trim().length >= 3 &&
          Boolean(form.categoryId) &&
          form.description.trim().length >= 10
        );
      case 1:
        return true;
      case 2:
        return Number(form.pricePerDay) > 0;
      case 3:
        return form.addressText.trim().length >= 3 && form.city.trim().length > 0;
      case 4:
        return form.images.length >= 1;
      default:
        return true;
    }
  })();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Canon EOS R5 camera"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
              <p
                className={`text-xs ${
                  form.description.trim().length >= 10 ? "text-muted-foreground" : "text-destructive"
                }`}
              >
                {form.description.trim().length}/10 characters minimum
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.categoryId}
                onChange={(e) => {
                  set("categoryId", e.target.value);
                  set("subcategoryId", "");
                }}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
              >
                <option value="">Choose a category</option>
                {topLevelCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {form.categoryId && childCategories(form.categoryId).length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subcategory">Subcategory</Label>
                <select
                  id="subcategory"
                  value={form.subcategoryId}
                  onChange={(e) => set("subcategoryId", e.target.value)}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
                >
                  <option value="">None</option>
                  {childCategories(form.categoryId).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={form.condition}
                onChange={(e) => set("condition", e.target.value as ProductCondition)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={form.model} onChange={(e) => set("model", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price per day (₹)</Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={form.pricePerDay}
                onChange={(e) => set("pricePerDay", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deposit">Security deposit (₹)</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                value={form.securityDeposit}
                onChange={(e) => set("securityDeposit", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minDays">Minimum rental (days)</Label>
                <Input
                  id="minDays"
                  type="number"
                  min={1}
                  value={form.minRentalDays}
                  onChange={(e) => set("minRentalDays", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxDays">Maximum rental (days, optional)</Label>
                <Input
                  id="maxDays"
                  type="number"
                  min={1}
                  value={form.maxRentalDays}
                  onChange={(e) => set("maxRentalDays", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.addressText}
                onChange={(e) => set("addressText", e.target.value)}
                placeholder="Street, area"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
            <Button type="button" variant="outline" className="w-fit" onClick={useMyLocation} disabled={locating}>
              {locating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
              {form.lat ? "Location set" : "Use my current location"}
            </Button>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="radius">Visible to nearby searches within (km)</Label>
              <Input
                id="radius"
                type="number"
                min={1}
                value={form.visibilityRadiusKm}
                onChange={(e) => set("visibilityRadiusKm", e.target.value)}
              />
            </div>
            <Separator />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.pickupAvailable}
                onChange={(e) => set("pickupAvailable", e.target.checked)}
              />
              Customer can pick up
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.deliveryAvailable}
                onChange={(e) => set("deliveryAvailable", e.target.checked)}
              />
              I can deliver
            </label>
            {form.deliveryAvailable && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deliveryRadius">Delivery radius (km)</Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  min={0}
                  value={form.deliveryRadiusKm}
                  onChange={(e) => set("deliveryRadiusKm", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <Label htmlFor="images">Photos (up to 10)</Label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img) => (
                <div key={img.tempId} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <Image src={img.url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.tempId)}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-1"
                  >
                    <X className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCover(img.tempId)}
                    className={`absolute bottom-1 left-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      img.isCover ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground"
                    }`}
                  >
                    {img.isCover ? "Cover" : "Set cover"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <AvailabilityStep
            blocks={form.availabilityBlocks}
            onAdd={addAvailabilityBlock}
            onRemove={removeAvailabilityBlock}
          />
        )}

        {step === 6 && (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-foreground">
              <span className="font-medium">{form.title}</span> — ₹{form.pricePerDay || 0}/day
            </p>
            <p className="text-muted-foreground">{form.city}</p>
            <p className="text-muted-foreground">{form.images.length} photo(s)</p>
            {error && <p className="text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" disabled={pending} onClick={() => submit(true)}>
                {pending ? "Publishing…" : "Publish now"}
              </Button>
              <Button type="button" variant="outline" disabled={pending} onClick={() => submit(false)}>
                Save as draft
              </Button>
            </div>
          </div>
        )}

        {error && step !== 6 && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => {
            setError(null);
            setStep((s) => Math.max(0, s - 1));
          }}
        >
          Back
        </Button>
        {step < 6 && (
          <Button
            type="button"
            disabled={!stepValid}
            onClick={() => {
              setError(null);
              setStep((s) => Math.min(STEPS.length - 1, s + 1));
            }}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}

function AvailabilityStep({
  blocks,
  onAdd,
  onRemove,
}: {
  blocks: AvailabilityBlock[];
  onAdd: (start: string, end: string) => void;
  onRemove: (index: number) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Optional — block any dates you already know this item won&apos;t be available.
      </p>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="blockStart">From</Label>
          <Input id="blockStart" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="blockEnd">To</Label>
          <Input id="blockEnd" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onAdd(start, end);
            setStart("");
            setEnd("");
          }}
        >
          Add
        </Button>
      </div>
      {blocks.length > 0 && (
        <ul className="flex flex-col gap-2">
          {blocks.map((b, i) => (
            <li key={`${b.startDate}-${b.endDate}`} className="flex items-center justify-between text-sm">
              <span>
                {b.startDate} → {b.endDate}
              </span>
              <button type="button" onClick={() => onRemove(i)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
