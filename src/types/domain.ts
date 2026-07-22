/**
 * Hand-written domain types not (yet) derivable from generated Supabase
 * types. Enum values must stay byte-for-byte identical to the Postgres enums
 * in supabase/migrations/0001_init.sql — see specs/database-schema.md § 3.
 */

export type ProductCondition = "new" | "like_new" | "good" | "fair";

export type ProductStatus =
  | "draft"
  | "available"
  | "booking_requested"
  | "booked"
  | "rented"
  | "returned"
  | "hidden"
  | "maintenance";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "active"
  | "returned"
  | "disputed"
  | "completed";

export type CancelledByParty = "customer" | "owner" | "admin";

export type PaymentType =
  | "rental_charge"
  | "deposit_hold"
  | "deposit_release"
  | "refund"
  | "payout";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentProviderName = "mock" | "razorpay";

export type ReportTargetType = "user" | "product";

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
