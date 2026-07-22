"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPhoneOtp, verifyPhoneOtp } from "@/features/auth/actions";

export function VerifyPhoneForm({ onVerified }: { onVerified?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [sendState, sendAction, sending] = useActionState(sendPhoneOtp, null);
  const [verifyState, verifyAction, verifying] = useActionState(verifyPhoneOtp, null);

  useEffect(() => {
    if (verifyState?.ok) {
      onVerified?.();
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyState]);

  if (verifyState?.ok) {
    return (
      <p className="text-sm text-status-success">Phone number verified.</p>
    );
  }

  if (step === "phone") {
    return (
      <form
        action={async (formData) => {
          await sendAction(formData);
          setStep("code");
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            required
          />
        </div>
        {sendState && !sendState.ok && (
          <p className="text-sm text-destructive">{sendState.error.message}</p>
        )}
        <Button type="submit" disabled={sending} className="w-fit">
          {sending ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code we sent.
        {sendState?.ok && sendState.data.devOtp && (
          <span className="block font-mono text-foreground">
            Dev mode — your code is {sendState.data.devOtp}
          </span>
        )}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          required
        />
      </div>
      {verifyState && !verifyState.ok && (
        <p className="text-sm text-destructive">{verifyState.error.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={verifying} className="w-fit">
          {verifying ? "Verifying…" : "Verify"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-fit"
          onClick={() => setStep("phone")}
        >
          Change number
        </Button>
      </div>
    </form>
  );
}
