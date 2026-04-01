import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { createProjectActionWithDependencies } from "@/features/projects/actions/create-project";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { saveProjectIntakeActionWithDependencies } from "@/features/intake/actions/save-project-intake";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { listProjectActivityForUser } from "@/features/projects/queries/list-project-activity";
import { listProjectsForUser } from "@/features/projects/queries/list-projects";
import { proxy } from "@/proxy";
import { getDefaultWorkspaceIdForUser } from "@/server/permissions/workspace";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { SESSION_COOKIE_NAME } from "@/server/auth/constants";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import {
  createNavigationHarness,
  RedirectSignal,
} from "@/tests/support/navigation";

test("proxy redirects signed-out users away from protected routes", () => {
  const response = proxy(
    new NextRequest("http://localhost:3000/projects/project-123"),
  );

  assert.equal(response.headers.get("location"), "http://localhost:3000/sign-in");
});

test("proxy redirects signed-in users away from auth routes", () => {
  const response = proxy(
    new NextRequest("http://localhost:3000/sign-in", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=integration-test-session`,
      },
    }),
  );

  assert.equal(response.headers.get("location"), "http://localhost:3000/projects");
});

test("authenticated users can create a project and complete intake inside their workspace", async (t) => {
  const integration = createIntegrationContext();
  t.after(async () => {
    await integration.cleanup();
  });

  const owner = await integration.createWorkspaceMember({
    name: "Owner Builder",
  });
  const outsider = await integration.createWorkspaceMember({
    name: "Outside Viewer",
  });
  const navigation = createNavigationHarness();

  let projectWorkspacePath = "";

  try {
    await createProjectActionWithDependencies(
      {
        db,
        requireCurrentUser: async () => owner.user,
        getDefaultWorkspaceIdForUser,
        logProjectActivity,
        redirect: navigation.redirect,
      },
      {},
      createFormData({
        title: "Main Floor Renovation",
        projectType: "kitchen",
        locationLabel: "Toronto",
        goals: "Improve flow and storage.",
      }),
    );

    assert.fail("Expected project creation to redirect into the project workspace.");
  } catch (error) {
    assert.ok(error instanceof RedirectSignal);
    projectWorkspacePath = error.location;
  }

  assert.match(projectWorkspacePath, /^\/projects\/[^/]+$/);
  const projectId = projectWorkspacePath.replace("/projects/", "");

  const workspaceProjects = await listProjectsForUser(owner.user.id);
  assert.equal(workspaceProjects.length, 1);
  assert.equal(workspaceProjects[0]?.id, projectId);
  assert.equal(workspaceProjects[0]?.title, "Main Floor Renovation");

  const project = await getProjectForUser(projectId, owner.user.id);
  assert.ok(project);
  assert.equal(project.projectType, "kitchen");
  assert.equal(project.locationLabel, "Toronto");

  const outsiderProject = await getProjectForUser(projectId, outsider.user.id);
  assert.equal(outsiderProject, null);

  const intakeNavigation = createNavigationHarness();

  try {
    await saveProjectIntakeActionWithDependencies(
      {
        db,
        requireCurrentUser: async () => owner.user,
        getProjectForUser,
        revalidatePath: intakeNavigation.revalidatePath,
        redirect: intakeNavigation.redirect,
      },
      projectId,
      {},
      createFormData({
        intent: "complete",
        renovationType: "kitchen",
        roomsRaw: "Kitchen\nDining room",
        goals: "Open up sight lines and add better storage.",
        prioritiesRaw: "Storage\nWorkflow",
        timingExpectation: "Start in June and finish before August.",
        budgetRange: "$75k - $150k",
        constraintsRaw: "Stay in the home\nPreserve hardwood",
        contractorInvolvement: "hiring_gc",
        notes: "Need staged work for the family schedule.",
      }),
    );

    assert.fail("Expected intake completion to redirect into scope.");
  } catch (error) {
    assert.ok(error instanceof RedirectSignal);
    assert.equal(error.location, `/projects/${projectId}/scope`);
  }

  assert.deepEqual(intakeNavigation.revalidatedPaths, [
    "/projects",
    `/projects/${projectId}`,
    `/projects/${projectId}/intake`,
    `/projects/${projectId}/scope`,
  ]);

  const intakeRecord = await getProjectIntakeForUser(projectId, owner.user.id);
  assert.ok(intakeRecord?.intake);
  assert.equal(intakeRecord.intake.renovationType, "kitchen");
  assert.equal(intakeRecord.intake.completedAt instanceof Date, true);
  assert.deepEqual(intakeRecord.intake.rooms, ["Kitchen", "Dining room"]);

  const persistedProject = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      status: true,
      projectType: true,
      goals: true,
    },
  });

  assert.deepEqual(persistedProject, {
    status: "intake",
    projectType: "kitchen",
    goals: "Open up sight lines and add better storage.",
  });

  const activity = await listProjectActivityForUser(projectId, owner.user.id);
  assert.deepEqual(
    activity.map((entry) => entry.eventType),
    ["intake_completed", "intake_started", "project_created"],
  );
});
