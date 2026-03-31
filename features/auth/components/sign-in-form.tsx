"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/features/auth/actions/auth-action-state";
import { signInAction } from "@/features/auth/actions/sign-in";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

const initialState: AuthActionState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <AuthFormShell
      title="Sign in"
      description="Access your renovation workspace and protected project routes."
      footer={
        <p className="text-muted text-sm">
          Need an account?{" "}
          <Link href="/sign-up" className="text-foreground font-medium">
            Create one
          </Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="owner@scopehouse.local"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="••••••••"
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
          {pending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-muted text-xs leading-6">
          Demo seed credentials after `npm run db:seed`:
          `owner@scopehouse.local` / `scopehouse-demo`
        </p>
      </form>
    </AuthFormShell>
  );
}
