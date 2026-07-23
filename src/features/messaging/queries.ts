import { createClient } from "@/lib/supabase/server";

export type ThreadListItem = {
  id: string;
  customer_id: string;
  owner_id: string;
  last_message_at: string | null;
  products: { id: string; title: string; cover_image_url: string | null } | null;
  unreadCount: number;
};

export async function getThreads(): Promise<ThreadListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("message_threads")
    .select("id, customer_id, owner_id, last_message_at, products (id, title, cover_image_url)")
    .or(`customer_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const threads = (data ?? []) as unknown as Omit<ThreadListItem, "unreadCount">[];
  if (threads.length === 0) return [];

  const { data: unread } = await supabase
    .from("messages")
    .select("thread_id")
    .in(
      "thread_id",
      threads.map((t) => t.id),
    )
    .neq("sender_id", user.id)
    .is("read_at", null);

  const unreadCounts = new Map<string, number>();
  for (const row of (unread ?? []) as { thread_id: string }[]) {
    unreadCounts.set(row.thread_id, (unreadCounts.get(row.thread_id) ?? 0) + 1);
  }

  return threads.map((t) => ({ ...t, unreadCount: unreadCounts.get(t.id) ?? 0 }));
}

export async function getTotalUnreadCount(): Promise<number> {
  const threads = await getThreads();
  return threads.reduce((sum, t) => sum + t.unreadCount, 0);
}

export type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export async function getThreadDetail(threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: thread } = await supabase
    .from("message_threads")
    .select("id, customer_id, owner_id, products (id, title, cover_image_url)")
    .eq("id", threadId)
    .single();
  if (!thread) return null;
  const t = thread as unknown as {
    id: string;
    customer_id: string;
    owner_id: string;
    products: { id: string; title: string; cover_image_url: string | null } | null;
  };
  if (t.customer_id !== user.id && t.owner_id !== user.id) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, thread_id, sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  return {
    thread: t,
    messages: (messages ?? []) as MessageRow[],
    currentUserId: user.id,
  };
}
