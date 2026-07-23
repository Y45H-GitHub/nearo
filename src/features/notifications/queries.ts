import { createClient } from "@/lib/supabase/server";
import { renderNotification } from "@/lib/notifications/templates";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

export async function getNotifications(limit = 30): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("id, template_key, payload, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as {
    id: string;
    template_key: string;
    payload: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  }[]).map((row) => {
    const { title, body } = renderNotification(row.template_key, row.payload ?? {});
    return {
      id: row.id,
      title,
      body,
      href: typeof row.payload?.href === "string" ? row.payload.href : "/notifications",
      read_at: row.read_at,
      created_at: row.created_at,
    };
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}
