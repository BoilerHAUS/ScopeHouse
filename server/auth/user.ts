import { WorkspaceRole } from "@prisma/client";
import { db } from "@/server/db/client";
import { hashPassword } from "@/server/auth/password";
import { createWorkspaceSlug } from "@/server/auth/slug";

type CreateUserInput = {
  email: string;
  password: string;
  name?: string;
};

export async function createUserWithWorkspace({
  email,
  password,
  name,
}: CreateUserInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash,
      },
    });

    const workspaceLabel =
      name?.trim() || normalizedEmail.split("@")[0] || "ScopeHouse";
    const workspace = await tx.workspace.create({
      data: {
        name: `${workspaceLabel} Workspace`,
        slug: `${createWorkspaceSlug(workspaceLabel)}-${user.id.slice(-6)}`,
      },
    });

    await tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.OWNER,
      },
    });

    return { user, workspace };
  });
}
