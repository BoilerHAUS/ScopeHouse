import assert from "node:assert/strict";
import test from "node:test";
import { saveChangeOrderActionWithDependencies } from "@/features/change-orders/actions/save-change-order";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("change-order query is access-controlled and sorted newest-first", async (t) => {
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

  await db.changeOrder.createMany({
    data: [
      {
        projectId: project.id,
        title: "Move island outlets",
        description: "Shift outlets into the new island.",
        status: "approved",
        requestedAt: new Date("2026-04-10T12:00:00.000Z"),
        impactSummary: "Minor electrical rework.",
      },
      {
        projectId: project.id,
        title: "Raise pantry ceiling",
        description: "Adjust framing for more headroom.",
        status: "proposed",
        requestedAt: new Date("2026-04-14T12:00:00.000Z"),
        impactSummary: "Adds framing labor and inspection time.",
      },
    ],
  });

  const changeOrders = await listProjectChangeOrdersForUser(project.id, owner.user.id);
  assert.ok(changeOrders);
  assert.deepEqual(
    changeOrders.map((entry) => entry.title),
    ["Raise pantry ceiling", "Move island outlets"],
  );

  const outsiderView = await listProjectChangeOrdersForUser(
    project.id,
    outsider.user.id,
  );
  assert.equal(outsiderView, null);
});

test("saveChangeOrderAction persists the normalized request date and revalidates project views", async (t) => {
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

  const result = await saveChangeOrderActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    {},
    createFormData({
      title: "Add under-cabinet lighting",
      description: "Expand the electrical scope for task lighting.",
      status: "approved",
      requestedAt: "2026-07-02",
      impactSummary: "Adds one electrician visit and fixture allowance.",
      budgetReference: "Budget line 12",
      scheduleReference: "Electrical rough-in",
      notes: "Owner approved on site.",
    }),
  );

  assert.equal(result.success, "Change order created.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/change-orders`,
    `/projects/${project.id}/export`,
  ]);

  const changeOrder = await db.changeOrder.findFirst({
    where: {
      projectId: project.id,
      title: "Add under-cabinet lighting",
    },
    select: {
      requestedAt: true,
      budgetReference: true,
      scheduleReference: true,
    },
  });

  assert.equal(changeOrder?.requestedAt.toISOString(), "2026-07-02T12:00:00.000Z");
  assert.equal(changeOrder?.budgetReference, "Budget line 12");
  assert.equal(changeOrder?.scheduleReference, "Electrical rough-in");
});
