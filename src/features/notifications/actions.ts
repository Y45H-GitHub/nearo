"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

// Both actions only revalidate when a row actually flipped to read, mirroring
// features/messaging/actions.ts::markThreadRead — the header's unread badge
// lives in the root layout, which client-side nav won't refetch on its own.
export async function markNotificationRead(id: string): Promise<void> {
  const { supabase, userId } = await requireUser();
  if (!userId) return;

  const { data } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("read_at", null)
    .select("id");

  if (data && data.length > 0) {
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { supabase, userId } = await requireUser();
  if (!userId) return;

  const { data } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)
    .select("id");

  if (data && data.length > 0) {
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
  }
}
