import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
        Log in to Nearo
      </h1>
      <LoginForm redirectTo={redirect || "/"} />
    </div>
  );
}
