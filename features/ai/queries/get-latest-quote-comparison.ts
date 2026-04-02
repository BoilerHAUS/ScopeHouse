import { cache } from "react";
import { db } from "@/server/db/client";
import { quoteCompareOutputSchema } from "@/features/ai/schemas/quote-compare";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export const getLatestQuoteComparisonForUser = cache(
  async (projectId: string, userId: string) => {
    const project = await getProjectForUser(projectId, userId);

    if (!project) {
      return null;
    }

    const generation = await db.aiGeneration.findFirst({
      where: {
        projectId,
        workflow: "quote_compare",
        status: "completed",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        model: true,
        promptVersion: true,
        createdAt: true,
        outputObject: true,
      },
    });

    if (!generation?.outputObject) {
      return null;
    }

    const outputResult = quoteCompareOutputSchema.safeParse(generation.outputObject);

    if (!outputResult.success) {
      return null;
    }

    return {
      id: generation.id,
      model: generation.model,
      promptVersion: generation.promptVersion,
      createdAt: generation.createdAt,
      output: outputResult.data,
    };
  },
);
