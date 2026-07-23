import { cn } from "@/lib/utils";

export function MessageBubble({
  body,
  isOwnMessage,
  createdAt,
}: {
  body: string;
  isOwnMessage: boolean;
  createdAt: string;
}) {
  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-line">{body}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
