import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; suspended?: string }>;
}) {
  const { redirect, suspended } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
        Log in to Nearo
      </h1>
      {suspended && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          This account has been suspended.
        </p>
      )}
      <LoginForm redirectTo={redirect || "/"} />
    </div>
  );
}
