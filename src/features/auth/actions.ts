"use server";

import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  signUpSchema,
  signInSchema,
  phoneSchema,
  otpCodeSchema,
  profileSchema,
} from "@/lib/validation/auth";
import { actionError, actionOk, type ActionResult } from "@/lib/validation/errors";

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 3;

export async function signUp(
  _prevState: ActionResult<{ needsEmailConfirmation: boolean }> | null,
  formData: FormData,
): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return actionError("UNKNOWN", error.message);
  }

  // profiles row is created by the handle_new_user DB trigger (0002_auth_support.sql).
  return actionOk({ needsEmailConfirmation: !data.session });
}

export async function signInWithPassword(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return actionError("INVALID_CREDENTIALS", "Incorrect email or password.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", data.user.id)
    .single();
  if ((profile as { is_suspended?: boolean } | null)?.is_suspended) {
    await supabase.auth.signOut();
    return actionError("SUSPENDED", "This account has been suspended.");
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/";
  redirect(redirectTo);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPhoneOtp(
  _prevState: ActionResult<{ devOtp?: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ devOtp?: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("UNAUTHENTICATED", "Sign in first.");
  }

  const parsed = phoneSchema.safeParse({ phone: formData.get("phone") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.from("phone_otps").insert({
    profile_id: user.id,
    phone: parsed.data.phone,
    code,
    expires_at: expiresAt,
  });
  if (error) {
    return actionError("UNKNOWN", error.message);
  }

  // MockSmsChannel behavior per ADR 0006 — no real SMS provider in MVP.
  console.log(`[MockSmsChannel] OTP for ${parsed.data.phone}: ${code}`);

  return actionOk({
    devOtp: process.env.NODE_ENV !== "production" ? code : undefined,
  });
}

export async function verifyPhoneOtp(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("UNAUTHENTICATED", "Sign in first.");
  }

  const parsed = otpCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const serviceRole = createServiceRoleClient();
  const { data: otpRow, error: fetchError } = await serviceRole
    .from("phone_otps")
    .select("id, code, phone, attempts, expires_at, consumed_at")
    .eq("profile_id", user.id)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !otpRow) {
    return actionError("OTP_EXPIRED", "Request a new code and try again.");
  }
  const row = otpRow as {
    id: string;
    code: string;
    phone: string;
    attempts: number;
    expires_at: string;
  };

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return actionError("OTP_LOCKED", "Too many attempts — request a new code.");
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return actionError("OTP_EXPIRED", "That code expired — request a new one.");
  }
  if (row.code !== parsed.data.code) {
    await serviceRole
      .from("phone_otps")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return actionError("OTP_INVALID", "Incorrect code.");
  }

  await serviceRole
    .from("phone_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ phone: row.phone, phone_verified_at: new Date().toISOString() })
    .eq("id", user.id);
  if (profileError) {
    return actionError("UNKNOWN", profileError.message);
  }

  revalidatePath("/profile");
  return actionOk(undefined);
}

export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("UNAUTHENTICATED", "Sign in first.");
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    bio: formData.get("bio"),
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
    })
    .eq("id", user.id);
  if (error) {
    return actionError("UNKNOWN", error.message);
  }

  revalidatePath("/profile");
  return actionOk(undefined);
}
