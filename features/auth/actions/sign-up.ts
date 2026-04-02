"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { createSession } from "@/server/auth/session";
import { createUserWithWorkspace } from "@/server/auth/user";
import type { AuthActionState } from "@/features/auth/actions/auth-action-state";
import { signUpSchema } from "@/features/auth/schemas/sign-up";
import { rateLimitAuthByIp } from "@/server/rate-limit/limit";
import { getRequestIpAddress } from "@/server/rate-limit/request";

export async function signUpAction(
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
          : "Too many sign-up attempts. Try again in a few minutes.",
      formValues: {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
      },
    };
  }

  const result = signUpSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
      formValues: {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
      },
    };
  }

  const { name, email, password } = result.data;

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
      fieldErrors: {
        email: "An account with that email already exists.",
      },
      formValues: {
        name,
        email,
      },
    };
  }

  const { user } = await createUserWithWorkspace({
    name,
    email,
    password,
  });

  await createSession(user.id);
  redirect("/projects");
}
