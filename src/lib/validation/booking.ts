import { z } from "zod";

export const requestBookingSchema = z
  .object({
    productId: z.string().uuid(),
    startDate: z.string().date(),
    endDate: z.string().date(),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type RequestBookingInput = z.infer<typeof requestBookingSchema>;
