import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectSectionsNav } from "@/components/navigation/project-sections-nav";

type ProjectLayoutProps = {
  children: ReactNode;
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectId } = await params;

  return (
    <AppShell sidebar={<ProjectSectionsNav projectId={projectId} />}>
      {children}
    </AppShell>
  );
}
