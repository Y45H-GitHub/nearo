"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startThread } from "@/features/messaging/actions";

export function MessageOwnerButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startThread(productId);
      if (!result.ok) {
        if (result.error.code === "UNAUTHENTICATED") {
          router.push(`/login?redirect=/listing/${productId}`);
          return;
        }
        setError(result.error.message);
        return;
      }
      router.push(`/messages/${result.data.threadId}`);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" variant="outline" onClick={handleClick} disabled={pending}>
        {pending ? "Opening…" : "Message owner"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
