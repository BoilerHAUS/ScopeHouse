import assert from "node:assert/strict";
import test from "node:test";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { saveScheduleMilestoneActionWithDependencies } from "@/features/schedule/actions/save-schedule-milestone";
import { getProjectScheduleForUser } from "@/features/schedule/queries/get-project-schedule";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("schedule query returns ordered phases and the next dated milestone", async (t) => {
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

  const phase = await db.schedulePhase.create({
    data: {
      projectId: project.id,
      name: "Pre-construction",
      itemOrder: 0,
    },
    select: {
      id: true,
    },
  });

  await db.scheduleMilestone.createMany({
    data: [
      {
        projectId: project.id,
        phaseId: phase.id,
        label: "Permits submitted",
        targetDate: "2026-05-18",
        itemOrder: 0,
      },
      {
        projectId: project.id,
        phaseId: phase.id,
        label: "Trades walk-through",
        targetDate: "2026-05-10",
        itemOrder: 1,
      },
    ],
  });

  const schedule = await getProjectScheduleForUser(project.id, owner.user.id);
  assert.ok(schedule);
  assert.equal(schedule.summary.phaseCount, 1);
  assert.equal(schedule.summary.milestoneCount, 2);
  assert.equal(schedule.summary.nextMilestone?.label, "Trades walk-through");
  assert.deepEqual(
    schedule.phases[0]?.milestones.map((milestone) => milestone.label),
    ["Permits submitted", "Trades walk-through"],
  );

  const unauthorizedSchedule = await getProjectScheduleForUser(
    project.id,
    outsider.user.id,
  );
  assert.equal(unauthorizedSchedule, null);
});

test("saveScheduleMilestoneAction appends milestones in order and rejects foreign phases", async (t) => {
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

  const phase = await db.schedulePhase.create({
    data: {
      projectId: project.id,
      name: "Construction",
      itemOrder: 0,
    },
    select: {
      id: true,
    },
  });

  await db.scheduleMilestone.create({
    data: {
      projectId: project.id,
      phaseId: phase.id,
      label: "Demolition starts",
      itemOrder: 0,
    },
  });

  const foreignPhase = await db.schedulePhase.create({
    data: {
      projectId: otherProject.id,
      name: "Foreign phase",
      itemOrder: 0,
    },
    select: {
      id: true,
    },
  });

  const invalidResult = await saveScheduleMilestoneActionWithDependencies(
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
      phaseId: foreignPhase.id,
      label: "Should fail",
      targetDate: "2026-06-01",
    }),
  );

  assert.equal(invalidResult.error, "Phase not found.");

  const navigation = createNavigationHarness();
  const result = await saveScheduleMilestoneActionWithDependencies(
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
      phaseId: phase.id,
      label: "Cabinets delivered",
      targetDate: "2026-06-05",
      notes: "Confirm site access one week prior.",
    }),
  );

  assert.equal(result.success, "Milestone created.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/schedule`,
  ]);

  const milestones = await db.scheduleMilestone.findMany({
    where: {
      projectId: project.id,
      phaseId: phase.id,
    },
    orderBy: {
      itemOrder: "asc",
    },
    select: {
      label: true,
      itemOrder: true,
    },
  });

  assert.deepEqual(milestones, [
    {
      label: "Demolition starts",
      itemOrder: 0,
    },
    {
      label: "Cabinets delivered",
      itemOrder: 1,
    },
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
    },
  });

  assert.equal(activity[0]?.eventType, "schedule_milestone_saved");
  assert.equal(activity[0]?.summary, "Added milestone Cabinets delivered.");
});
