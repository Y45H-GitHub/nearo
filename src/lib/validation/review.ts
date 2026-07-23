import { z } from "zod";

export const submitReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1, "Pick a rating").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
