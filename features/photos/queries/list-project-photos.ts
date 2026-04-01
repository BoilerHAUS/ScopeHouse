import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectPhotosForUser = cache(
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
        photos: {
          orderBy: {
            uploadedAt: "desc",
          },
          select: {
            id: true,
            projectId: true,
            createdById: true,
            originalName: true,
            contentType: true,
            sizeBytes: true,
            caption: true,
            roomTag: true,
            phaseTag: true,
            takenOn: true,
            uploadedAt: true,
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return project?.photos ?? null;
  },
);
