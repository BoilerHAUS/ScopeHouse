import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectChangeOrdersForUser = cache(
  async (projectId: string, userId: string) => {
    const workspaceIds = await listUserWorkspaceIds(userId);

    if (workspaceIds.length === 0) {
      return null;
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: {
          in: workspaceIds,
        },
      },
      select: {
        changeOrders: {
          orderBy: [{ requestedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            projectId: true,
            title: true,
            description: true,
            status: true,
            requestedAt: true,
            impactSummary: true,
            budgetReference: true,
            scheduleReference: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return project.changeOrders;
  },
);
