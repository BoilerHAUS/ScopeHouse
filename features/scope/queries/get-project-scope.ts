import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";
import { buildScopeTree } from "@/features/scope/services/build-scope-tree";

export const getProjectScopeForUser = cache(
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
        scopeItems: {
          orderBy: [
            { phaseOrder: "asc" },
            { areaOrder: "asc" },
            { itemOrder: "asc" },
          ],
          select: {
            id: true,
            projectId: true,
            phaseName: true,
            phaseOrder: true,
            areaName: true,
            areaOrder: true,
            itemOrder: true,
            label: true,
            notes: true,
            status: true,
            source: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return buildScopeTree(project?.scopeItems ?? []);
  },
);
