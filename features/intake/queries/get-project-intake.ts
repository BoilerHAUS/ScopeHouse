import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const getProjectIntakeForUser = cache(
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
        id: true,
        projectType: true,
        goals: true,
        intake: {
          select: {
            id: true,
            projectId: true,
            renovationType: true,
            rooms: true,
            goals: true,
            priorities: true,
            timingExpectation: true,
            budgetRange: true,
            constraints: true,
            contractorInvolvement: true,
            notes: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return {
      projectId: project.id,
      fallbackProjectType: project.projectType,
      fallbackGoals: project.goals,
      intake: project.intake
        ? {
            ...project.intake,
            rooms: Array.isArray(project.intake.rooms)
              ? project.intake.rooms.filter((item): item is string => typeof item === "string")
              : [],
            priorities: Array.isArray(project.intake.priorities)
              ? project.intake.priorities.filter(
                  (item): item is string => typeof item === "string",
                )
              : [],
            constraints: Array.isArray(project.intake.constraints)
              ? project.intake.constraints.filter(
                  (item): item is string => typeof item === "string",
                )
              : [],
          }
        : null,
    };
  },
);
