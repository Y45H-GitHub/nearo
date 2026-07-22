"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

export async function toggleWishlist(
  productId: string,
): Promise<ActionResult<{ wishlisted: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("UNAUTHENTICATED", "Sign in to save items.");
  }

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", (existing as { id: string }).id);
    if (error) return actionError("UNKNOWN", error.message);
    revalidatePath("/wishlist");
    return actionOk({ wishlisted: false });
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: user.id, product_id: productId });
  if (error) return actionError("UNKNOWN", error.message);

  revalidatePath("/wishlist");
  return actionOk({ wishlisted: true });
}
