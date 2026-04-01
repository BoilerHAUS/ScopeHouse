import { cache } from "react";
import { db } from "@/server/db/client";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const getProjectScheduleForUser = cache(
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
        schedulePhases: {
          orderBy: {
            itemOrder: "asc",
          },
          select: {
            id: true,
            projectId: true,
            name: true,
            notes: true,
            targetStartDate: true,
            targetEndDate: true,
            itemOrder: true,
            milestones: {
              orderBy: {
                itemOrder: "asc",
              },
              select: {
                id: true,
                projectId: true,
                phaseId: true,
                label: true,
                notes: true,
                targetDate: true,
                itemOrder: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    const milestones = project.schedulePhases.flatMap((phase) => phase.milestones);
    const datedMilestones = milestones
      .filter((milestone) => Boolean(milestone.targetDate))
      .sort((left, right) => {
        if (!left.targetDate || !right.targetDate) {
          return 0;
        }

        return left.targetDate.localeCompare(right.targetDate);
      });

    return {
      phases: project.schedulePhases,
      summary: {
        phaseCount: project.schedulePhases.length,
        milestoneCount: milestones.length,
        nextMilestone: datedMilestones[0] ?? null,
      },
    };
  },
);
