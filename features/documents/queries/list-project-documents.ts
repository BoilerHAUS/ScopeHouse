import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const listProjectDocumentsForUser = cache(
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
        documents: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            projectId: true,
            createdById: true,
            originalName: true,
            contentType: true,
            sizeBytes: true,
            tags: true,
            createdAt: true,
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

    if (!project) {
      return null;
    }

    return project.documents.map((document) => ({
      ...document,
      tags: Array.isArray(document.tags)
        ? document.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
    }));
  },
);
