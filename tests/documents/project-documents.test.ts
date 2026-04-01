import assert from "node:assert/strict";
import test from "node:test";
import { deleteProjectDocumentActionWithDependencies } from "@/features/documents/actions/delete-project-document";
import { uploadProjectDocumentActionWithDependencies } from "@/features/documents/actions/upload-project-document";
import { listProjectDocumentsForUser } from "@/features/documents/queries/list-project-documents";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("document query filters non-string tags and delete action removes authorized records", async (t) => {
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

  const document = await db.projectDocument.create({
    data: {
      projectId: project.id,
      createdById: owner.user.id,
      originalName: "kitchen-drawings.pdf",
      storageKey: `tests/${project.id}/kitchen-drawings.pdf`,
      contentType: "application/pdf",
      sizeBytes: 1024,
      tags: ["permit", 42, "drawings"],
    },
    select: {
      id: true,
      storageKey: true,
    },
  });

  const listedDocuments = await listProjectDocumentsForUser(project.id, owner.user.id);
  assert.ok(listedDocuments);
  assert.deepEqual(listedDocuments[0]?.tags, ["permit", "drawings"]);

  const deletedKeys: string[] = [];
  const navigation = createNavigationHarness();

  await deleteProjectDocumentActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      deleteProjectFile: async (storageKey) => {
        deletedKeys.push(storageKey);
      },
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    createFormData({
      documentId: document.id,
    }),
  );

  assert.deepEqual(deletedKeys, [document.storageKey]);
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/documents`,
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

  assert.equal(activity[0]?.eventType, "document_deleted");
  assert.equal(activity[0]?.summary, "Removed document kitchen-drawings.pdf.");

  const remainingDocument = await db.projectDocument.findUnique({
    where: {
      id: document.id,
    },
  });
  assert.equal(remainingDocument, null);

  const outsiderDocuments = await listProjectDocumentsForUser(
    project.id,
    outsider.user.id,
  );
  assert.equal(outsiderDocuments, null);
});

test("deleteProjectDocumentAction ignores unauthorized deletions", async (t) => {
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

  const document = await db.projectDocument.create({
    data: {
      projectId: project.id,
      createdById: owner.user.id,
      originalName: "spec-sheet.pdf",
      storageKey: `tests/${project.id}/spec-sheet.pdf`,
      contentType: "application/pdf",
      sizeBytes: 512,
    },
    select: {
      id: true,
    },
  });

  let deleted = false;

  await deleteProjectDocumentActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => outsider.user,
      getProjectForUser,
      deleteProjectFile: async () => {
        deleted = true;
      },
      logProjectActivity,
      revalidatePath: () => {},
    },
    project.id,
    createFormData({
      documentId: document.id,
    }),
  );

  assert.equal(deleted, false);
  const persisted = await db.projectDocument.findUnique({
    where: {
      id: document.id,
    },
  });
  assert.ok(persisted);
});

test("uploadProjectDocumentAction stores metadata and logs document uploads", async (t) => {
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

  const formData = createFormData({
    tags: "permit, drawings",
  });
  formData.set(
    "file",
    new File(["drawing"], "permit-set.pdf", {
      type: "application/pdf",
    }),
  );

  const result = await uploadProjectDocumentActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      saveProjectFile: async () => ({
        storageKey: `tests/${project.id}/permit-set.pdf`,
        absolutePath: "/tmp/permit-set.pdf",
      }),
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    {},
    formData,
  );

  assert.equal(result.success, "Document uploaded.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/documents`,
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

  assert.equal(activity[0]?.eventType, "document_uploaded");
  assert.equal(activity[0]?.summary, "Uploaded document permit-set.pdf.");
});
