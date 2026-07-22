import { createClient } from "@/lib/supabase/server";

async function getCategoryCount() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { connected: false as const, count: 0 };
  }
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return { connected: true as const, count: count ?? 0 };
  } catch {
    return { connected: false as const, count: 0 };
  }
}

export default async function Home() {
  const { connected, count } = await getCategoryCount();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          What do you need today?
        </h1>
        <p className="text-lg text-muted-foreground">
          M0 scaffolding is live — Next.js 15, Tailwind v4, shadcn/ui, dark
          mode, and the Supabase connection are wired up. The real homepage
          ships in M3.
        </p>

        <div className="w-full rounded-lg border border-border bg-card p-6 text-left shadow-sm">
          <p className="text-sm font-medium text-foreground">
            Supabase connection
          </p>
          {connected ? (
            <p className="mt-1 text-sm text-status-success">
              Connected — {count} categor{count === 1 ? "y" : "ies"} seeded.
            </p>
          ) : (
            <p className="mt-1 text-sm text-status-pending">
              Not connected yet — set NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local once the project is
              provisioned.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
