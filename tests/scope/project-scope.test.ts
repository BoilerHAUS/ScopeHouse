import assert from "node:assert/strict";
import test from "node:test";
import type { ScopeDraftOutput } from "@/features/ai/schemas/scope-draft";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";
import { flattenScopeDraftForPersistence } from "@/features/scope/services/flatten-scope-draft";
import { normalizeProjectScopeOrdering } from "@/features/scope/services/normalize-project-scope-ordering";
import { db } from "@/server/db/client";
import { createIntegrationContext } from "@/tests/support/db";

test("flattenScopeDraftForPersistence maps AI statuses into persisted scope items", () => {
  const draft: ScopeDraftOutput = {
    projectSummary: "Kitchen renovation baseline.",
    assumptions: ["Appliances stay in place."],
    risks: ["Electrical scope may expand after demo."],
    phases: [
      {
        name: "Pre-construction",
        areas: [
          {
            name: "Whole project",
            items: [
              {
                label: "Verify measurements",
                status: "included",
                notes: "Confirm before cabinet order.",
              },
              {
                label: "Investigate knob-and-tube",
                status: "needs_info",
                notes: null,
              },
            ],
          },
        ],
      },
      {
        name: "Construction",
        areas: [
          {
            name: "Kitchen",
            items: [
              {
                label: "Install cabinets",
                status: "optional",
                notes: "Owner may supply separately.",
              },
            ],
          },
        ],
      },
    ],
  };

  const flattened = flattenScopeDraftForPersistence(
    "project-123",
    "draft-123",
    draft,
  );

  assert.deepEqual(flattened, [
    {
      projectId: "project-123",
      appliedFromDraftId: "draft-123",
      phaseName: "Pre-construction",
      phaseOrder: 0,
      areaName: "Whole project",
      areaOrder: 0,
      itemOrder: 0,
      label: "Verify measurements",
      notes: "Confirm before cabinet order.",
      status: "active",
      source: "ai_draft",
    },
    {
      projectId: "project-123",
      appliedFromDraftId: "draft-123",
      phaseName: "Pre-construction",
      phaseOrder: 0,
      areaName: "Whole project",
      areaOrder: 0,
      itemOrder: 1,
      label: "Investigate knob-and-tube",
      notes: null,
      status: "needs_info",
      source: "ai_draft",
    },
    {
      projectId: "project-123",
      appliedFromDraftId: "draft-123",
      phaseName: "Construction",
      phaseOrder: 1,
      areaName: "Kitchen",
      areaOrder: 0,
      itemOrder: 0,
      label: "Install cabinets",
      notes: "Owner may supply separately.",
      status: "draft",
      source: "ai_draft",
    },
  ]);
});

test("normalizeProjectScopeOrdering re-sequences phases and areas for authorized users", async (t) => {
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

  await db.scopeItem.createMany({
    data: [
      {
        projectId: project.id,
        phaseName: "Construction",
        phaseOrder: 10,
        areaName: "Kitchen",
        areaOrder: 4,
        itemOrder: 7,
        label: "Install flooring",
        source: "manual",
      },
      {
        projectId: project.id,
        phaseName: "Pre-construction",
        phaseOrder: 99,
        areaName: "Whole project",
        areaOrder: 9,
        itemOrder: 2,
        label: "Verify measurements",
        source: "manual",
      },
      {
        projectId: project.id,
        phaseName: "Construction",
        phaseOrder: 11,
        areaName: "Kitchen",
        areaOrder: 5,
        itemOrder: 8,
        label: "Set cabinets",
        source: "manual",
      },
    ],
  });

  await normalizeProjectScopeOrdering(project.id);

  const orderedItems = await db.scopeItem.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: [
      { phaseOrder: "asc" },
      { areaOrder: "asc" },
      { itemOrder: "asc" },
    ],
    select: {
      phaseName: true,
      phaseOrder: true,
      areaName: true,
      areaOrder: true,
      label: true,
      itemOrder: true,
    },
  });

  assert.deepEqual(orderedItems, [
    {
      phaseName: "Construction",
      phaseOrder: 0,
      areaName: "Kitchen",
      areaOrder: 0,
      label: "Install flooring",
      itemOrder: 0,
    },
    {
      phaseName: "Construction",
      phaseOrder: 0,
      areaName: "Kitchen",
      areaOrder: 0,
      label: "Set cabinets",
      itemOrder: 1,
    },
    {
      phaseName: "Pre-construction",
      phaseOrder: 1,
      areaName: "Whole project",
      areaOrder: 0,
      label: "Verify measurements",
      itemOrder: 0,
    },
  ]);

  const scope = await getProjectScopeForUser(project.id, owner.user.id);
  assert.equal(scope.length, 2);
  assert.equal(scope[0]?.phaseName, "Construction");
  assert.deepEqual(
    scope[0]?.areas[0]?.items.map((item) => item.label),
    ["Install flooring", "Set cabinets"],
  );

  const outsiderScope = await getProjectScopeForUser(project.id, outsider.user.id);
  assert.deepEqual(outsiderScope, []);
});
