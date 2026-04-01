import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

type ListProjectsForUserOptions = {
  archived?: boolean;
};

export const listProjectsForUser = cache(
  async (userId: string, options: ListProjectsForUserOptions = {}) => {
    const workspaceIds = await listUserWorkspaceIds(userId);
    const archived = options.archived ?? false;

    if (workspaceIds.length === 0) {
      return [];
    }

    return db.project.findMany({
      where: {
        workspaceId: {
          in: workspaceIds,
        },
        archivedAt: archived ? { not: null } : null,
      },
      orderBy: archived ? { archivedAt: "desc" } : { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        projectType: true,
        status: true,
        locationLabel: true,
        archivedAt: true,
        updatedAt: true,
      },
    });
  },
);
