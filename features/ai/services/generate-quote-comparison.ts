import { runStructuredAiWorkflow } from "@/server/ai/run-structured-workflow";
import { quoteCompareOutputSchema } from "@/features/ai/schemas/quote-compare";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";
import { listProjectQuotesForUser } from "@/features/quotes/queries/list-project-quotes";

export async function generateQuoteComparisonForUser(
  projectId: string,
  userId: string,
) {
  const [project, scope, quotes] = await Promise.all([
    getProjectForUser(projectId, userId),
    getProjectScopeForUser(projectId, userId),
    listProjectQuotesForUser(projectId, userId),
  ]);

  if (!project) {
    throw new Error("Project source data was not found.");
  }

  if (quotes.length === 0) {
    throw new Error("No quotes have been added to compare.");
  }

  const workflowInput = {
    project: {
      title: project.title,
      projectType: project.projectType,
      locationLabel: project.locationLabel,
    },
    scope: scope.map((phase) => ({
      name: phase.phaseName,
      areas: phase.areas.map((area) => ({
        name: area.areaName,
        items: area.items.map((item) => ({
          label: item.label,
          notes: item.notes ?? null,
        })),
      })),
    })),
    quotes: quotes.map((quote) => ({
      contractor: quote.contractor,
      amountCents: quote.amountCents ?? null,
      scopeReference: quote.scopeReference ?? null,
      notes: quote.notes ?? null,
    })),
  };

  const result = await runStructuredAiWorkflow({
    workflow: "quote_compare",
    schema: quoteCompareOutputSchema,
    input: workflowInput,
    projectId,
  });

  return {
    generationId: result.generationId,
    model: result.model,
    promptVersion: result.promptVersion,
    output: result.output,
  };
}
