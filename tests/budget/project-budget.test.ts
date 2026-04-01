import assert from "node:assert/strict";
import test from "node:test";
import { saveBudgetLineActionWithDependencies } from "@/features/budget/actions/save-budget-line";
import { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("saveBudgetLineAction persists ordered amounts and budget query rolls up totals", async (t) => {
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

  const category = await db.budgetCategory.create({
    data: {
      projectId: project.id,
      label: "Cabinetry",
      notes: "Primary interior millwork.",
      status: "active",
      itemOrder: 0,
    },
    select: {
      id: true,
    },
  });

  await db.budgetLine.create({
    data: {
      projectId: project.id,
      categoryId: category.id,
      label: "Existing allowance",
      estimateCents: 120000,
      allowanceCents: 150000,
      quotedCents: null,
      actualCents: null,
      itemOrder: 0,
    },
  });

  const navigation = createNavigationHarness();
  const result = await saveBudgetLineActionWithDependencies(
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
      categoryId: category.id,
      label: "Custom cabinets",
      estimate: "1000",
      allowance: "1250",
      quoted: "1400",
      actual: "1450",
      sourceReference: "Vendor quote #14",
      notes: "Includes installation.",
    }),
  );

  assert.equal(result.success, "Line created.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/budget`,
  ]);

  const lines = await db.budgetLine.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: {
      itemOrder: "asc",
    },
    select: {
      label: true,
      estimateCents: true,
      allowanceCents: true,
      quotedCents: true,
      actualCents: true,
      itemOrder: true,
    },
  });

  assert.deepEqual(lines.map((line) => line.itemOrder), [0, 1]);
  assert.deepEqual(lines[1], {
    label: "Custom cabinets",
    estimateCents: 100000,
    allowanceCents: 125000,
    quotedCents: 140000,
    actualCents: 145000,
    itemOrder: 1,
  });

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

  assert.equal(activity[0]?.eventType, "budget_line_saved");
  assert.equal(activity[0]?.summary, "Added budget line Custom cabinets.");

  const budget = await getProjectBudgetForUser(project.id, owner.user.id);
  assert.ok(budget);
  assert.equal(budget.categories.length, 1);
  assert.deepEqual(budget.totals, {
    estimateCents: 220000,
    allowanceCents: 275000,
    quotedCents: 140000,
    actualCents: 145000,
    planningCents: 295000,
  });

  const unauthorizedBudget = await getProjectBudgetForUser(
    project.id,
    outsider.user.id,
  );
  assert.equal(unauthorizedBudget, null);
});

test("saveBudgetLineAction rejects categories outside the current project", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember();
  const project = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
  });
  const otherProject = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
    title: "Other project",
  });

  const foreignCategory = await db.budgetCategory.create({
    data: {
      projectId: otherProject.id,
      label: "Foreign category",
      status: "active",
      itemOrder: 0,
    },
    select: {
      id: true,
    },
  });

  const result = await saveBudgetLineActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      logProjectActivity,
      revalidatePath: () => {},
    },
    project.id,
    {},
    createFormData({
      categoryId: foreignCategory.id,
      label: "Should fail",
      estimate: "",
      allowance: "",
      quoted: "",
      actual: "",
      sourceReference: "",
      notes: "",
    }),
  );

  assert.equal(result.error, "Choose a valid project budget category.");
});
