import assert from "node:assert/strict";
import test from "node:test";
import {
  generateQuoteComparisonActionWithDependencies,
  type QuoteComparisonActionState,
} from "@/features/ai/actions/generate-quote-comparison";
import { getLatestQuoteComparisonForUser } from "@/features/ai/queries/get-latest-quote-comparison";
import { deleteQuoteActionWithDependencies } from "@/features/quotes/actions/delete-quote";
import { saveQuoteActionWithDependencies } from "@/features/quotes/actions/save-quote";
import { listProjectQuotesForUser } from "@/features/quotes/queries/list-project-quotes";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("quote queries are access-controlled and quote save/delete actions log activity", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember();
  const outsider = await integration.createWorkspaceMember();
  const project = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
  });
  const navigation = createNavigationHarness();

  const saveResult = await saveQuoteActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    {},
    createFormData({
      contractor: "Northline Builders",
      amount: "45250",
      scopeReference: "Kitchen cabinetry, counters, and trim",
      notes: "Excludes electrical permit.",
    }),
  );

  assert.equal(saveResult.success, "Quote added.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/quotes`,
  ]);

  const quotes = await listProjectQuotesForUser(project.id, owner.user.id);
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0]?.contractor, "Northline Builders");
  assert.equal(quotes[0]?.amountCents, 4_525_000);

  const outsiderQuotes = await listProjectQuotesForUser(project.id, outsider.user.id);
  assert.deepEqual(outsiderQuotes, []);

  await deleteQuoteActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    createFormData({
      quoteId: quotes[0]!.id,
    }),
  );

  const persistedQuotes = await listProjectQuotesForUser(project.id, owner.user.id);
  assert.equal(persistedQuotes.length, 0);

  const activity = await db.activityLog.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      eventType: true,
      summary: true,
    },
  });

  assert.deepEqual(
    activity.slice(0, 2).map((entry) => entry.eventType),
    ["quote_deleted", "quote_saved"],
  );
  assert.equal(activity[0]?.summary, "Removed quote from Northline Builders.");
});

test("generateQuoteComparisonAction logs activity and latest comparison query returns structured output", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember();
  const project = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
  });
  const navigation = createNavigationHarness();

  const result = await generateQuoteComparisonActionWithDependencies(
    {
      requireCurrentUser: async () => owner.user,
      generateQuoteComparisonForUser: async () => ({
        generationId: "gen_quote_123",
        model: "gpt-5-mini",
        promptVersion: "quote-compare/v1",
        output: {
          summary: "One quote covers the full scope while one leaves finish work unclear.",
          coverageGaps: ["Painter finish scope is missing from one quote."],
          overlaps: ["Both quotes include demolition and disposal."],
          risks: ["Allowance language is vague on countertop fabrication."],
          quoteNotes: [
            {
              vendor: "Northline Builders",
              notes: ["Most complete scope coverage."],
            },
          ],
        },
      }),
      getProjectForUser,
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    {} satisfies QuoteComparisonActionState,
  );

  assert.deepEqual(result, {});
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}/quotes`,
  ]);

  const activity = await db.activityLog.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      eventType: true,
      summary: true,
      metadata: true,
    },
  });

  assert.equal(activity[0]?.eventType, "quote_comparison_generated");
  assert.equal(activity[0]?.summary, "Generated AI quote comparison.");

  await db.aiGeneration.create({
    data: {
      projectId: project.id,
      workflow: "quote_compare",
      status: "completed",
      model: "gpt-5-mini",
      promptVersion: "quote-compare/v1",
      outputObject: {
        summary: "Northline is more complete.",
        coverageGaps: ["No appliance allowance in Southridge quote."],
        overlaps: ["Both include demolition."],
        risks: ["Permit coordination is not explicit."],
        quoteNotes: [
          {
            vendor: "Northline Builders",
            notes: ["Best alignment with the current scope tree."],
          },
        ],
      },
      responsePayload: {},
      completedAt: new Date(),
    },
  });

  const latestComparison = await getLatestQuoteComparisonForUser(
    project.id,
    owner.user.id,
  );

  assert.ok(latestComparison);
  assert.equal(latestComparison.output.summary, "Northline is more complete.");
  assert.equal(latestComparison.output.quoteNotes[0]?.vendor, "Northline Builders");
});
