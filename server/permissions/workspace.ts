import { db } from "@/server/db/client";

export async function requireWorkspaceAccess(
  workspaceId: string,
  userId: string,
) {
  const membership = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized workspace access.");
  }

  return membership;
}

export async function listUserWorkspaceIds(userId: string) {
  const memberships = await db.workspaceMember.findMany({
    where: {
      userId,
    },
    select: {
      workspaceId: true,
    },
  });

  return memberships.map((membership) => membership.workspaceId);
}

export async function getDefaultWorkspaceIdForUser(userId: string) {
  const membership = await db.workspaceMember.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      workspaceId: true,
    },
  });

  return membership?.workspaceId ?? null;
}
