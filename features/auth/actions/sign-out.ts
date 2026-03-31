"use server";

import { redirect } from "next/navigation";
import { signOutCurrentSession } from "@/server/auth/session";

export async function signOutAction() {
  await signOutCurrentSession();
  redirect("/sign-in");
}
