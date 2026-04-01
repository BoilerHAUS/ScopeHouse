"use server";

import { ActivityEventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

type ArchiveProjectActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  revalidatePath: typeof revalidatePath;
};

const archiveProjectActionDependencies: ArchiveProjectActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  revalidatePath,
};

export async function archiveProjectAction(projectId: string) {
  return archiveProjectActionWithDependencies(
    archiveProjectActionDependencies,
    projectId,
  );
}

export async function archiveProjectActionWithDependencies(
  dependencies: ArchiveProjectActionDependencies,
  projectId: string,
) {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

  if (!project || project.archivedAt) {
    return;
  }

  const archivedAt = new Date();

  await dependencies.db.$transaction(async (tx) => {
    await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        archivedAt,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        workspaceId: project.workspaceId,
        actorId: user.id,
        eventType: ActivityEventType.project_archived,
        summary: `Archived project ${project.title}.`,
        metadata: {
          archivedAt: archivedAt.toISOString(),
        },
      },
    });
  });

  dependencies.revalidatePath("/projects");
  dependencies.revalidatePath(`/projects/${projectId}`);
}
