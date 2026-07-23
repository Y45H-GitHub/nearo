"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications/notify";
import { sendMessageSchema } from "@/lib/validation/messaging";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

async function requireVerified() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, verified: false } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_verified_at")
    .eq("id", user.id)
    .single();
  const verified =
    Boolean(user.email_confirmed_at) &&
    Boolean((profile as { phone_verified_at?: string | null } | null)?.phone_verified_at);
  return { supabase, user, verified } as const;
}

export async function startThread(productId: string): Promise<ActionResult<{ threadId: string }>> {
  const { supabase, user, verified } = await requireVerified();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!verified) return actionError("UNVERIFIED", "Verify your email and phone to message an owner.");

  const { data: product } = await supabase
    .from("products")
    .select("id, owner_id")
    .eq("id", productId)
    .single();
  if (!product) return actionError("NOT_FOUND", "Listing not found.");
  const p = product as { id: string; owner_id: string };
  if (p.owner_id === user.id) {
    return actionError("VALIDATION_ERROR", "You can't message yourself about your own listing.");
  }

  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("product_id", productId)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (existing) {
    return actionOk({ threadId: (existing as { id: string }).id });
  }

  const { data: thread, error } = await supabase
    .from("message_threads")
    .insert({ product_id: productId, customer_id: user.id, owner_id: p.owner_id })
    .select("id")
    .single();
  if (error || !thread) return actionError("UNKNOWN", error?.message ?? "Could not start conversation.");

  revalidatePath("/messages");
  return actionOk({ threadId: (thread as { id: string }).id });
}

export async function sendMessage(
  threadId: string,
  body: string,
): Promise<ActionResult> {
  const { supabase, user, verified } = await requireVerified();
  if (!user) return actionError("UNAUTHENTICATED", "Sign in first.");
  if (!verified) return actionError("UNVERIFIED", "Verify your email and phone to send messages.");

  const parsed = sendMessageSchema.safeParse({ threadId, body });
  if (!parsed.success) return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);

  const { data: thread } = await supabase
    .from("message_threads")
    .select("id, customer_id, owner_id, product_id")
    .eq("id", threadId)
    .single();
  if (!thread) return actionError("NOT_FOUND", "Conversation not found.");
  const t = thread as { id: string; customer_id: string; owner_id: string; product_id: string };
  if (t.customer_id !== user.id && t.owner_id !== user.id) {
    return actionError("NOT_OWNER", "You're not part of this conversation.");
  }

  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (error) return actionError("UNKNOWN", error.message);

  const recipientId = t.customer_id === user.id ? t.owner_id : t.customer_id;
  const [{ data: sender }, { data: product }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("products").select("title").eq("id", t.product_id).single(),
  ]);
  await notify(recipientId, "message_received", {
    senderName: (sender as { full_name?: string } | null)?.full_name || "Someone",
    productTitle: (product as { title?: string } | null)?.title || "a listing",
    href: `/messages/${threadId}`,
  });

  revalidatePath(`/messages/${threadId}`);
  revalidatePath("/messages");
  return actionOk(undefined);
}

export async function markThreadRead(threadId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: updated } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .neq("sender_id", user.id)
    .is("read_at", null)
    .select("id");

  // Only revalidate when something actually flipped to read — this runs on
  // every poll tick, and the header badge lives in the root layout, so an
  // unconditional revalidate here would re-render it every 4s for nothing.
  if (updated && updated.length > 0) {
    revalidatePath("/messages");
    revalidatePath("/", "layout");
  }
}
