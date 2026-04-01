import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectsForUser = cache(async (userId: string) => {
  const workspaceIds = await listUserWorkspaceIds(userId);

  if (workspaceIds.length === 0) {
    return [];
  }

  return db.project.findMany({
    where: {
      workspaceId: {
        in: workspaceIds,
      },
      archivedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      projectType: true,
      status: true,
      locationLabel: true,
      updatedAt: true,
    },
  });
});
