"use server";

import { ActivityEventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

type RestoreProjectActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  revalidatePath: typeof revalidatePath;
};

const restoreProjectActionDependencies: RestoreProjectActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  revalidatePath,
};

export async function restoreProjectAction(projectId: string) {
  return restoreProjectActionWithDependencies(
    restoreProjectActionDependencies,
    projectId,
  );
}

export async function restoreProjectActionWithDependencies(
  dependencies: RestoreProjectActionDependencies,
  projectId: string,
) {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

  if (!project || !project.archivedAt) {
    return;
  }

  const archivedAt = project.archivedAt;

  await dependencies.db.$transaction(async (tx) => {
    await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        archivedAt: null,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        workspaceId: project.workspaceId,
        actorId: user.id,
        eventType: ActivityEventType.project_restored,
        summary: `Restored project ${project.title}.`,
        metadata: {
          restoredFromArchivedAt: archivedAt.toISOString(),
        },
      },
    });
  });

  dependencies.revalidatePath("/projects");
  dependencies.revalidatePath(`/projects/${projectId}`);
}
