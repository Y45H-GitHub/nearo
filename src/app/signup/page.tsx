import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
        Create your Nearo account
      </h1>
      <SignupForm />
    </div>
  );
}
