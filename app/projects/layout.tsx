import type { ReactNode } from "react";
import { requireCurrentUser } from "@/server/auth/session";

type ProtectedProjectsLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedProjectsLayout({
  children,
}: ProtectedProjectsLayoutProps) {
  await requireCurrentUser();
  return children;
}
