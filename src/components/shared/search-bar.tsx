"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar({
  variant = "compact",
  defaultValue = "",
  className,
}: {
  variant?: "hero" | "compact";
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex items-center gap-2",
        variant === "hero" && "w-full max-w-xl rounded-full border border-border bg-card p-2 shadow-md",
        variant === "compact" && "w-full max-w-sm",
        className,
      )}
    >
      <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you need today?"
        className={cn(
          "border-none shadow-none focus-visible:ring-0",
          variant === "hero" && "h-10 text-base",
        )}
      />
      <Button type="submit" size={variant === "hero" ? "default" : "sm"} className="shrink-0 rounded-full">
        Search
      </Button>
    </form>
  );
}
