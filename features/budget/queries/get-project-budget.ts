import { cache } from "react";
import { db } from "@/server/db/client";
import { calculateBudgetRollup } from "@/features/budget/services/budget-calculations";
import { listUserWorkspaceIds } from "@/server/permissions/workspace";

export const getProjectBudgetForUser = cache(
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
        budgetCategories: {
          orderBy: {
            itemOrder: "asc",
          },
          select: {
            id: true,
            projectId: true,
            label: true,
            notes: true,
            status: true,
            itemOrder: true,
            lines: {
              orderBy: {
                itemOrder: "asc",
              },
              select: {
                id: true,
                projectId: true,
                categoryId: true,
                scopeItemId: true,
                label: true,
                estimateCents: true,
                allowanceCents: true,
                quotedCents: true,
                actualCents: true,
                sourceReference: true,
                notes: true,
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

    const categories = project.budgetCategories.map((category) => ({
      ...category,
      totals: calculateBudgetRollup(category.lines),
    }));

    return {
      categories,
      totals: calculateBudgetRollup(categories.flatMap((category) => category.lines)),
    };
  },
);
