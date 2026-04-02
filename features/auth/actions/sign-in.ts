"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { createSession } from "@/server/auth/session";
import { verifyPassword } from "@/server/auth/password";
import type { AuthActionState } from "@/features/auth/actions/auth-action-state";
import { rateLimitAuthByIp } from "@/server/rate-limit/limit";
import { getRequestIpAddress } from "@/server/rate-limit/request";

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await rateLimitAuthByIp(await getRequestIpAddress());
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Too many sign-in attempts. Try again in a few minutes.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      error: "Invalid email or password.",
    };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return {
      error: "Invalid email or password.",
    };
  }

  await createSession(user.id);
  redirect("/projects");
}
