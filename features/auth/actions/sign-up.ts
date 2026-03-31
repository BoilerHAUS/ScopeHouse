"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { createSession } from "@/server/auth/session";
import { createUserWithWorkspace } from "@/server/auth/user";
import type { AuthActionState } from "@/features/auth/actions/auth-action-state";

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return {
      error: "Name, email, and password are required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    };
  }

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
