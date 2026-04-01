import assert from "node:assert/strict";
import test from "node:test";
import { archiveProjectActionWithDependencies } from "@/features/projects/actions/archive-project";
import { restoreProjectActionWithDependencies } from "@/features/projects/actions/restore-project";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { listProjectsForUser } from "@/features/projects/queries/list-projects";
import { db } from "@/server/db/client";
import { createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("archiveProjectAction archives the project, hides it from the active list, and logs activity", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember();
  const project = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
    title: "Back Addition",
  });
  const navigation = createNavigationHarness();

  await archiveProjectActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
  );

  assert.deepEqual(navigation.revalidatedPaths, [
    "/projects",
    `/projects/${project.id}`,
  ]);

  const archivedProject = await getProjectForUser(project.id, owner.user.id);
  assert.ok(archivedProject?.archivedAt instanceof Date);

  const activeProjects = await listProjectsForUser(owner.user.id, {
    archived: false,
  });
  const archivedProjects = await listProjectsForUser(owner.user.id, {
    archived: true,
  });

  assert.equal(activeProjects.length, 0);
  assert.equal(archivedProjects.length, 1);
  assert.equal(archivedProjects[0]?.id, project.id);
  assert.ok(archivedProjects[0]?.archivedAt instanceof Date);

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

  assert.equal(activity[0]?.eventType, "project_archived");
  assert.equal(activity[0]?.summary, "Archived project Back Addition.");
});

test("restoreProjectAction restores an archived project and logs activity", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember();
  const project = await integration.createProject({
    workspaceId: owner.workspace.id,
    createdById: owner.user.id,
    title: "Garden Suite",
  });

  await db.project.update({
    where: {
      id: project.id,
    },
    data: {
      archivedAt: new Date("2026-03-15T10:00:00.000Z"),
    },
  });

  const navigation = createNavigationHarness();

  await restoreProjectActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
  );

  assert.deepEqual(navigation.revalidatedPaths, [
    "/projects",
    `/projects/${project.id}`,
  ]);

  const restoredProject = await getProjectForUser(project.id, owner.user.id);
  assert.equal(restoredProject?.archivedAt, null);

  const activeProjects = await listProjectsForUser(owner.user.id, {
    archived: false,
  });
  const archivedProjects = await listProjectsForUser(owner.user.id, {
    archived: true,
  });

  assert.equal(activeProjects.length, 1);
  assert.equal(activeProjects[0]?.id, project.id);
  assert.equal(archivedProjects.length, 0);

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

  assert.equal(activity[0]?.eventType, "project_restored");
  assert.equal(activity[0]?.summary, "Restored project Garden Suite.");
});

test("project archive actions ignore projects outside the current workspace", async (t) => {
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

  await archiveProjectActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => outsider.user,
      getProjectForUser,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
  );

  assert.deepEqual(navigation.revalidatedPaths, []);

  const persistedProject = await db.project.findUnique({
    where: {
      id: project.id,
    },
    select: {
      archivedAt: true,
    },
  });

  assert.equal(persistedProject?.archivedAt, null);

  const activityCount = await db.activityLog.count({
    where: {
      projectId: project.id,
    },
  });

  assert.equal(activityCount, 0);
});
