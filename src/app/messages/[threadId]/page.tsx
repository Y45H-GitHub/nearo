import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageBubble } from "@/features/messaging/components/message-bubble";
import { MessageComposer } from "@/features/messaging/components/message-composer";
import { ThreadPoller } from "@/features/messaging/components/thread-poller";
import { getThreadDetail } from "@/features/messaging/queries";
import { markThreadRead } from "@/features/messaging/actions";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const result = await getThreadDetail(threadId);
  if (!result) notFound();
  const { thread, messages, currentUserId } = result;

  void markThreadRead(threadId);

  return (
    <div className="mx-auto flex h-[calc(100vh-65px)] max-w-2xl flex-col px-6 py-6">
      <ThreadPoller />
      <Link href="/messages" className="mb-3 text-sm text-muted-foreground">
        ← All messages
      </Link>

      <div className="mb-4 flex items-center gap-3 rounded-lg border border-border p-3">
        {thread.products?.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thread.products.cover_image_url}
            alt=""
            className="h-12 w-12 rounded-md object-cover"
          />
        )}
        <Link href={`/listing/${thread.products?.id}`} className="font-medium text-foreground">
          {thread.products?.title ?? "Listing"}
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Say hello — ask about availability, pickup, or anything else.
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              body={m.body}
              isOwnMessage={m.sender_id === currentUserId}
              createdAt={m.created_at}
            />
          ))
        )}
      </div>

      <div className="mt-4">
        <MessageComposer threadId={threadId} />
      </div>
    </div>
  );
}
