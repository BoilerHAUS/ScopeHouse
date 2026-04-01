import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectSectionsNav } from "@/components/navigation/project-sections-nav";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

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
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    notFound();
  }

  return (
    <AppShell
      sidebar={
        <ProjectSectionsNav
          projectId={projectId}
          projectTitle={project.title}
          projectStatus={project.status}
        />
      }
    >
      {children}
    </AppShell>
  );
}
