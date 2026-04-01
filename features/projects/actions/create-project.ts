"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getDefaultWorkspaceIdForUser } from "@/server/permissions/workspace";
import { logProjectActivity } from "@/server/activity/log";
import {
  createProjectSchema,
  type CreateProjectActionState,
} from "@/features/projects/schemas/create-project";

export async function createProjectAction(
  _previousState: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const user = await requireCurrentUser();
  const workspaceId = await getDefaultWorkspaceIdForUser(user.id);

  if (!workspaceId) {
    return {
      error: "No workspace is available for this account.",
    };
  }

  const result = createProjectSchema.safeParse({
    title: formData.get("title"),
    projectType: formData.get("projectType"),
    locationLabel: formData.get("locationLabel"),
    goals: formData.get("goals"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        title: fieldErrors.title?.[0],
        projectType: fieldErrors.projectType?.[0],
        locationLabel: fieldErrors.locationLabel?.[0],
        goals: fieldErrors.goals?.[0],
      },
    };
  }

  const project = await db.project.create({
    data: {
      workspaceId,
      createdById: user.id,
      title: result.data.title,
      projectType: result.data.projectType,
      locationLabel: result.data.locationLabel,
      goals: result.data.goals,
    },
    select: {
      id: true,
      title: true,
      workspaceId: true,
    },
  });

  await logProjectActivity({
    projectId: project.id,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "project_created",
    summary: `Created project ${project.title}.`,
    metadata: {
      projectType: result.data.projectType,
    },
  });

  redirect(`/projects/${project.id}`);
}
