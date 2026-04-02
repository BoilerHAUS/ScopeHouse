import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectQuotesForUser = cache(
  async (projectId: string, userId: string) => {
    const workspaceIds = await listUserWorkspaceIds(userId);

    if (workspaceIds.length === 0) {
      return [];
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: { in: workspaceIds },
      },
      select: {
        quotes: {
          orderBy: { itemOrder: "asc" },
          select: {
            id: true,
            projectId: true,
            contractor: true,
            amountCents: true,
            scopeReference: true,
            notes: true,
            itemOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!project) {
      return [];
    }

    return project.quotes;
  },
);
