import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  parentId: z.string().uuid().optional().or(z.literal("")),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const resolveDisputeSchema = z.object({
  bookingId: z.string().uuid(),
  outcome: z.enum(["returned", "cancelled"]),
  notes: z.string().trim().min(1, "Add a resolution note").max(1000),
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
