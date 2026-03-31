"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/features/auth/actions/auth-action-state";
import { signUpAction } from "@/features/auth/actions/sign-up";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <AuthFormShell
      title="Create account"
      description="Create a personal ScopeHouse workspace for MVP development and protected project access."
      footer={
        <p className="text-muted text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Jamie Builder"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="jamie@example.com"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>
        {state.error ? (
          <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
            {state.error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={pending}
        >
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
