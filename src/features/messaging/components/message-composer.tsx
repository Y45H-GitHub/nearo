"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/features/messaging/actions";

export function MessageComposer({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(threadId, body);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setValue("");
      inputRef.current?.focus();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write a message…"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !value.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
