import { redirect } from "next/navigation";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getCurrentUser } from "@/server/auth/session";

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/projects");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  );
}
