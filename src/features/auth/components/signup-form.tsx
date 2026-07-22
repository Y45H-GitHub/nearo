"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signUp } from "@/features/auth/actions";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, null);

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="font-medium text-foreground">Check your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a confirmation link — click it to activate your account,
          then come back and log in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleAuthButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {state && !state.ok && (
          <p className="text-sm text-destructive">{state.error.message}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
