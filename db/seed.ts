import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProjectStatus,
  ProjectType,
  WorkspaceRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

loadEnv();
loadEnv({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("scopehouse-demo", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "owner@scopehouse.local",
    },
    update: {
      name: "ScopeHouse Owner",
      passwordHash,
    },
    create: {
      email: "owner@scopehouse.local",
      name: "ScopeHouse Owner",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: {
      slug: "scopehouse-demo",
    },
    update: {
      name: "ScopeHouse Demo Workspace",
    },
    create: {
      name: "ScopeHouse Demo Workspace",
      slug: "scopehouse-demo",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {
      role: WorkspaceRole.OWNER,
    },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await prisma.project.upsert({
    where: {
      id: "scopehouse-demo-project",
    },
    update: {
      title: "Demo Kitchen Renovation",
      projectType: ProjectType.kitchen,
      locationLabel: "Toronto, ON",
      goals:
        "Create a calmer kitchen layout, improve storage, and prepare the project for scope planning.",
      status: ProjectStatus.intake,
      workspaceId: workspace.id,
      createdById: user.id,
      archivedAt: null,
    },
    create: {
      id: "scopehouse-demo-project",
      title: "Demo Kitchen Renovation",
      projectType: ProjectType.kitchen,
      locationLabel: "Toronto, ON",
      goals:
        "Create a calmer kitchen layout, improve storage, and prepare the project for scope planning.",
      status: ProjectStatus.intake,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
