import assert from "node:assert/strict";
import test from "node:test";
import { deleteProjectPhotoActionWithDependencies } from "@/features/photos/actions/delete-project-photo";
import { uploadProjectPhotoActionWithDependencies } from "@/features/photos/actions/upload-project-photo";
import { listProjectPhotosForUser } from "@/features/photos/queries/list-project-photos";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { logProjectActivity } from "@/server/activity/log";
import { db } from "@/server/db/client";
import { createFormData, createIntegrationContext } from "@/tests/support/db";
import { createNavigationHarness } from "@/tests/support/navigation";

test("uploadProjectPhotoAction stores metadata and logs photo uploads", async (t) => {
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

  const formData = createFormData({
    caption: "Before demolition",
    roomTag: "Kitchen",
    phaseTag: "Existing conditions",
    takenOn: "2026-04-15",
  });
  formData.set(
    "file",
    new File(["photo"], "before-demo.jpg", {
      type: "image/jpeg",
    }),
  );

  const result = await uploadProjectPhotoActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => owner.user,
      getProjectForUser,
      saveProjectFile: async () => ({
        storageKey: `tests/${project.id}/before-demo.jpg`,
        absolutePath: "/tmp/before-demo.jpg",
      }),
      logProjectActivity,
      revalidatePath: navigation.revalidatePath,
    },
    project.id,
    {},
    formData,
  );

  assert.equal(result.success, "Photo uploaded.");
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/photos`,
  ]);

  const photos = await listProjectPhotosForUser(project.id, owner.user.id);
  assert.ok(photos);
  assert.equal(photos[0]?.caption, "Before demolition");

  const outsiderPhotos = await listProjectPhotosForUser(project.id, outsider.user.id);
  assert.equal(outsiderPhotos, null);

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

  assert.equal(activity[0]?.eventType, "photo_uploaded");
  assert.equal(activity[0]?.summary, "Uploaded photo Before demolition.");
});

test("deleteProjectPhotoAction removes the record, calls storage delete, and logs the event", async (t) => {
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

  const photo = await db.projectPhoto.create({
    data: {
      projectId: project.id,
      createdById: owner.user.id,
      originalName: "progress-shot.jpg",
      storageKey: `tests/${project.id}/progress-shot.jpg`,
      contentType: "image/jpeg",
      sizeBytes: 2048,
      caption: "Island framing progress",
    },
    select: {
      id: true,
      storageKey: true,
    },
  });

  const deletedKeys: string[] = [];
  const navigation = createNavigationHarness();

  await deleteProjectPhotoActionWithDependencies(
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
      photoId: photo.id,
    }),
  );

  assert.deepEqual(deletedKeys, [photo.storageKey]);
  assert.deepEqual(navigation.revalidatedPaths, [
    `/projects/${project.id}`,
    `/projects/${project.id}/photos`,
  ]);

  const remainingPhoto = await db.projectPhoto.findUnique({
    where: {
      id: photo.id,
    },
  });
  assert.equal(remainingPhoto, null);

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

  assert.equal(activity[0]?.eventType, "photo_deleted");
  assert.equal(activity[0]?.summary, "Removed photo Island framing progress.");

  let unauthorizedDeleteCalled = false;

  const unauthorizedPhoto = await db.projectPhoto.create({
    data: {
      projectId: project.id,
      createdById: owner.user.id,
      originalName: "after-shot.jpg",
      storageKey: `tests/${project.id}/after-shot.jpg`,
      contentType: "image/jpeg",
      sizeBytes: 1024,
    },
    select: {
      id: true,
    },
  });

  await deleteProjectPhotoActionWithDependencies(
    {
      db,
      requireCurrentUser: async () => outsider.user,
      getProjectForUser,
      deleteProjectFile: async () => {
        unauthorizedDeleteCalled = true;
      },
      logProjectActivity,
      revalidatePath: () => undefined,
    },
    project.id,
    createFormData({
      photoId: unauthorizedPhoto.id,
    }),
  );

  assert.equal(unauthorizedDeleteCalled, false);
  const persistedPhoto = await db.projectPhoto.findUnique({
    where: {
      id: unauthorizedPhoto.id,
    },
  });
  assert.ok(persistedPhoto);
});
