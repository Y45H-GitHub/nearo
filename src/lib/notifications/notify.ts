import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { NotificationTemplateKey } from "@/lib/notifications/templates";

/**
 * The single dispatch point for every notification-worthy event (ADR 0006) —
 * call sites never insert into `notifications` directly. `payload.href` is
 * set by the caller (it knows which recipient and which link makes sense for
 * them — e.g. a participant gets /bookings/[id], an admin gets /admin/bookings
 * for the same event) and is read back as-is by the notification UI.
 * Uses the service-role client because `notifications` has no client insert
 * policy (system/service-role only, per database-schema.md § RLS).
 */
export async function notify(
  userId: string,
  templateKey: NotificationTemplateKey,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("notifications").insert({
    user_id: userId,
    template_key: templateKey,
    payload,
  });
}
