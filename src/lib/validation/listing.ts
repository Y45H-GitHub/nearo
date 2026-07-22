import { z } from "zod";
import { MAX_LISTING_IMAGES } from "@/config/constants";

export const productConditionSchema = z.enum(["new", "like_new", "good", "fair"]);

export const listingImageSchema = z.object({
  url: z.string().url(),
  isCover: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export const availabilityBlockSchema = z
  .object({
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine((b) => b.endDate >= b.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const listingInputSchema = z
  .object({
    title: z.string().trim().min(3, "Title is too short").max(120),
    description: z.string().trim().min(10, "Add a bit more detail").max(3000),
    categoryId: z.string().uuid("Choose a category"),
    subcategoryId: z.string().uuid().nullable().optional(),
    brand: z.string().trim().max(100).optional().or(z.literal("")),
    model: z.string().trim().max(100).optional().or(z.literal("")),
    condition: productConditionSchema,
    pricePerDay: z.number().positive("Enter a price"),
    securityDeposit: z.number().min(0),
    minRentalDays: z.number().int().min(1),
    maxRentalDays: z.number().int().min(1).nullable().optional(),
    pickupAvailable: z.boolean(),
    deliveryAvailable: z.boolean(),
    deliveryRadiusKm: z.number().min(0).nullable().optional(),
    addressText: z.string().trim().min(3, "Add an address"),
    city: z.string().trim().min(1, "City is required"),
    lat: z.number(),
    lng: z.number(),
    visibilityRadiusKm: z.number().positive().default(5),
    images: z.array(listingImageSchema).min(1, "Add at least one photo").max(MAX_LISTING_IMAGES),
    availabilityBlocks: z.array(availabilityBlockSchema).default([]),
  })
  .refine((v) => !v.maxRentalDays || v.maxRentalDays >= v.minRentalDays, {
    message: "Max rental days must be at least the minimum",
    path: ["maxRentalDays"],
  })
  .refine((v) => v.images.filter((i) => i.isCover).length === 1, {
    message: "Exactly one image must be marked as the cover",
    path: ["images"],
  });

export type ListingInput = z.infer<typeof listingInputSchema>;
