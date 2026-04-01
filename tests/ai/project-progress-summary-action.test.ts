import assert from "node:assert/strict";
import test from "node:test";
import {
  generateProjectProgressSummaryActionWithDependencies,
  type ProjectProgressSummaryActionState,
} from "@/features/ai/actions/generate-project-progress-summary";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createIntegrationContext } from "@/tests/support/db";
import {
  createNavigationHarness,
  RedirectSignal,
} from "@/tests/support/navigation";

test("generateProjectProgressSummaryAction logs AI summary generation and redirects back to export", async (t) => {
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

  try {
    await generateProjectProgressSummaryActionWithDependencies(
      {
        requireCurrentUser: async () => owner.user,
        generateProjectProgressSummaryForUser: async () => ({
          generationId: "gen_test_123",
          model: "gpt-5-mini",
          promptVersion: "progress-summary/v1",
          output: {
            summary: "Stable week",
            progress: ["Cabinet drawings approved"],
            blockers: [],
            nextActions: ["Confirm countertop template date"],
          },
        }),
        getProjectForUser,
        logProjectActivity,
        revalidatePath: navigation.revalidatePath,
        redirect: navigation.redirect,
      },
      project.id,
      {} satisfies ProjectProgressSummaryActionState,
    );

    assert.fail("Expected the action to redirect to the export page.");
  } catch (error) {
    assert.ok(error instanceof RedirectSignal);
    assert.equal(error.location, `/projects/${project.id}/export`);
  }

  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}/export`,
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

  assert.equal(activity[0]?.eventType, "progress_summary_generated");
  assert.equal(activity[0]?.summary, "Generated AI project progress summary.");
});
