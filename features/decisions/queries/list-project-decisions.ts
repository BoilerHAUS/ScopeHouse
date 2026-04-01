import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectDecisionsForUser = cache(
  async (projectId: string, userId: string) => {
    const workspaceIds = await listUserWorkspaceIds(userId);

    if (workspaceIds.length === 0) {
      return [];
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: {
          in: workspaceIds,
        },
      },
      select: {
        decisions: {
          orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            projectId: true,
            summary: true,
            owner: true,
            status: true,
            recordedAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return project?.decisions ?? [];
  },
);
