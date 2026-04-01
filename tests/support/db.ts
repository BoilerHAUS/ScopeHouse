import crypto from "node:crypto";
import type { ProjectStatus, ProjectType } from "@prisma/client";
import { db } from "@/server/db/client";

function uniqueValue(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

type CreateWorkspaceMemberInput = {
  name?: string;
  email?: string;
};

type CreateProjectInput = {
  workspaceId: string;
  createdById: string;
  title?: string;
  projectType?: ProjectType;
  locationLabel?: string | null;
  goals?: string | null;
  status?: ProjectStatus;
};

export function createIntegrationContext() {
  const workspaceIds = new Set<string>();
  const userIds = new Set<string>();

  return {
    async createWorkspaceMember(input: CreateWorkspaceMemberInput = {}) {
      const user = await db.user.create({
        data: {
          name: input.name ?? uniqueValue("Test User"),
          email: input.email ?? `${uniqueValue("scopehouse")}@example.com`,
          passwordHash: "test-password-hash",
        },
      });

      const workspace = await db.workspace.create({
        data: {
          name: uniqueValue("ScopeHouse Test Workspace"),
          slug: uniqueValue("scopehouse-test-workspace"),
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      await db.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      });

      userIds.add(user.id);
      workspaceIds.add(workspace.id);

      return {
        user,
        workspace,
      };
    },

    async createProject(input: CreateProjectInput) {
      return db.project.create({
        data: {
          workspaceId: input.workspaceId,
          createdById: input.createdById,
          title: input.title ?? uniqueValue("Test Project"),
          projectType: input.projectType ?? "kitchen",
          locationLabel: input.locationLabel ?? null,
          goals: input.goals ?? null,
          status: input.status ?? "draft",
        },
        select: {
          id: true,
          workspaceId: true,
          createdById: true,
          title: true,
          projectType: true,
          status: true,
        },
      });
    },

    async cleanup() {
      if (workspaceIds.size > 0) {
        await db.workspace.deleteMany({
          where: {
            id: {
              in: [...workspaceIds],
            },
          },
        });
      }

      if (userIds.size > 0) {
        await db.user.deleteMany({
          where: {
            id: {
              in: [...userIds],
            },
          },
        });
      }
    },
  };
}

export function createFormData(
  values: Record<string, string | null | undefined>,
) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      formData.set(key, value);
    }
  }

  return formData;
}
