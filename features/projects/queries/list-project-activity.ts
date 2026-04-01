import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectActivityForUser = cache(
  async (projectId: string, userId: string) => {
    const workspaceIds = await listUserWorkspaceIds(userId);

    if (workspaceIds.length === 0) {
      return [];
    }

    return db.activityLog.findMany({
      where: {
        projectId,
        workspaceId: {
          in: workspaceIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        eventType: true,
        summary: true,
        createdAt: true,
        actor: {
          select: {
            name: true,
          },
        },
      },
    });
  },
);
