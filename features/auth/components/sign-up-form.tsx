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
            defaultValue={state.formValues?.name ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Jamie Builder"
            required
          />
          {state.fieldErrors?.name ? (
            <p className="text-destructive text-sm">{state.fieldErrors.name}</p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={state.formValues?.email ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="jamie@example.com"
            required
          />
          {state.fieldErrors?.email ? (
            <p className="text-destructive text-sm">{state.fieldErrors.email}</p>
          ) : null}
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
          {state.fieldErrors?.password ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Re-enter your password"
            minLength={8}
            required
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
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
