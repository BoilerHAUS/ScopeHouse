import { cache } from "react";
import { db } from "@/server/db/client";
import { scopeDraftOutputSchema } from "@/features/ai/schemas/scope-draft";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

export const getLatestScopeDraftForUser = cache(
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
        scopeDrafts: {
          where: {
            status: {
              in: ["pending_review", "applied"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            projectId: true,
            projectSummary: true,
            phases: true,
            assumptions: true,
            risks: true,
            status: true,
            createdAt: true,
            appliedAt: true,
          },
        },
      },
    });

    const draft = project?.scopeDrafts[0];

    if (!draft) {
      return null;
    }

    const phases = scopeDraftOutputSchema.shape.phases.parse(draft.phases);

    return {
      id: draft.id,
      projectId: draft.projectId,
      projectSummary: draft.projectSummary,
      phases,
      assumptions: parseStringArray(draft.assumptions),
      risks: parseStringArray(draft.risks),
      status: draft.status,
      createdAt: draft.createdAt,
      appliedAt: draft.appliedAt,
    };
  },
);
