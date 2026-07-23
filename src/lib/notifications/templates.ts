/**
 * Renders every notification_events row from knowledge/business-rules.md
 * into display text. This is the single formatting surface — notify() call
 * sites pass structured payload, never pre-formatted strings (per ADR 0006),
 * so adding a channel later only means adding a renderer here, not touching
 * every call site.
 */
export type NotificationTemplateKey =
  | "booking_requested"
  | "booking_accepted"
  | "booking_rejected"
  | "booking_cancelled"
  | "rental_starting_soon"
  | "rental_return_due"
  | "message_received"
  | "review_received"
  | "dispute_opened";

type Payload = Record<string, unknown>;

function str(payload: Payload, key: string, fallback: string): string {
  const v = payload[key];
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

export function renderNotification(
  templateKey: string,
  payload: Payload,
): { title: string; body: string } {
  const productTitle = str(payload, "productTitle", "a listing");

  switch (templateKey as NotificationTemplateKey) {
    case "booking_requested":
      return {
        title: "New booking request",
        body: `${str(payload, "customerName", "Someone")} wants to book ${productTitle}.`,
      };
    case "booking_accepted":
      return { title: "Booking accepted", body: `Your request for ${productTitle} was accepted.` };
    case "booking_rejected":
      return { title: "Booking declined", body: `Your request for ${productTitle} was declined.` };
    case "booking_cancelled":
      return { title: "Booking cancelled", body: `The booking for ${productTitle} was cancelled.` };
    case "rental_starting_soon":
      return { title: "Rental starts tomorrow", body: `${productTitle} starts tomorrow.` };
    case "rental_return_due":
      return { title: "Rental ended", body: `${productTitle} has ended — check the return.` };
    case "message_received":
      return {
        title: "New message",
        body: `${str(payload, "senderName", "Someone")} sent you a message about ${productTitle}.`,
      };
    case "review_received":
      return {
        title: "New review",
        body: `${str(payload, "reviewerName", "Someone")} left you a ${str(payload, "rating", "")}★ review.`,
      };
    case "dispute_opened":
      return { title: "Dispute opened", body: `A dispute was opened for ${productTitle}.` };
    default:
      return { title: "Notification", body: "" };
  }
}
