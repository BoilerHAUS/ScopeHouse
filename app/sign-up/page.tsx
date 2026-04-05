import { redirect } from "next/navigation";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getCurrentUser } from "@/server/auth/session";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-paper)_96%,white)_0%,color-mix(in_srgb,var(--color-paper)_88%,var(--color-signal))_48%,color-mix(in_srgb,var(--color-paper)_88%,var(--color-signal-alt))_100%)]">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        <section className="flex flex-col justify-between border border-rule bg-ash px-6 py-6 text-paper shadow-[var(--shadow-xl)] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <p className="font-mono text-xs tracking-[0.28em] text-white/55 uppercase">
              ScopeHouse
            </p>
            <h1 className="font-display text-5xl leading-[0.9] tracking-[0.08em] uppercase">
              Create the workspace before the renovation gets expensive.
            </h1>
            <p className="max-w-xl text-sm leading-8 text-white/75 lg:text-base">
              Set up a personal workspace for intake, scope, budget, schedule,
              evidence, and decision control.
            </p>
          </div>
          <div className="space-y-3 border-t border-white/10 pt-6 text-sm text-white/72">
            <p>Built for serious homeowners and small renovation pros.</p>
            <p>No enterprise ballast.</p>
            <p>No magic hidden behind the record.</p>
          </div>
        </section>
        <div className="flex items-center">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
