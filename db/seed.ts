import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ActivityEventType,
  ContractorInvolvement,
  DecisionStatus,
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

  const project = await prisma.project.upsert({
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

  await prisma.projectIntake.upsert({
    where: {
      projectId: project.id,
    },
    update: {
      renovationType: ProjectType.kitchen,
      rooms: ["Kitchen", "Pantry", "Mudroom transition"],
      goals:
        "Create a calmer kitchen layout, improve storage, and prepare the project for scope planning.",
      priorities: ["Improve storage", "Open circulation", "Durable finishes"],
      timingExpectation: "Targeting a summer start with decisions made before contractor pricing.",
      budgetRange: "$75k - $150k",
      constraints: ["Need to keep part of the main floor functional", "Cabinet lead times may affect sequence"],
      contractorInvolvement: ContractorInvolvement.hiring_gc,
      notes: "Owners want an early scope draft before collecting comparable quotes.",
      completedAt: new Date(),
    },
    create: {
      projectId: project.id,
      renovationType: ProjectType.kitchen,
      rooms: ["Kitchen", "Pantry", "Mudroom transition"],
      goals:
        "Create a calmer kitchen layout, improve storage, and prepare the project for scope planning.",
      priorities: ["Improve storage", "Open circulation", "Durable finishes"],
      timingExpectation: "Targeting a summer start with decisions made before contractor pricing.",
      budgetRange: "$75k - $150k",
      constraints: ["Need to keep part of the main floor functional", "Cabinet lead times may affect sequence"],
      contractorInvolvement: ContractorInvolvement.hiring_gc,
      notes: "Owners want an early scope draft before collecting comparable quotes.",
      completedAt: new Date(),
    },
  });

  const activityEntries = [
    {
      projectId: project.id,
      workspaceId: workspace.id,
      actorId: user.id,
      eventType: ActivityEventType.project_created,
      summary: "Created project Demo Kitchen Renovation.",
    },
    {
      projectId: project.id,
      workspaceId: workspace.id,
      actorId: user.id,
      eventType: ActivityEventType.intake_started,
      summary: "Started guided intake.",
    },
    {
      projectId: project.id,
      workspaceId: workspace.id,
      actorId: user.id,
      eventType: ActivityEventType.intake_completed,
      summary: "Completed guided intake.",
    },
  ];

  for (const entry of activityEntries) {
    await prisma.activityLog.upsert({
      where: {
        id: `${project.id}-${entry.eventType}`,
      },
      update: entry,
      create: {
        id: `${project.id}-${entry.eventType}`,
        ...entry,
      },
    });
  }

  await prisma.decision.upsert({
    where: {
      id: "scopehouse-demo-decision",
    },
    update: {
      projectId: project.id,
      summary: "Confirm whether the owners want integrated or panel-ready refrigeration.",
      owner: "Homeowner",
      status: DecisionStatus.open,
      recordedAt: new Date("2026-03-15T12:00:00.000Z"),
      notes: "Affects cabinet layout, appliance allowances, and lead-time risk.",
    },
    create: {
      id: "scopehouse-demo-decision",
      projectId: project.id,
      summary: "Confirm whether the owners want integrated or panel-ready refrigeration.",
      owner: "Homeowner",
      status: DecisionStatus.open,
      recordedAt: new Date("2026-03-15T12:00:00.000Z"),
      notes: "Affects cabinet layout, appliance allowances, and lead-time risk.",
    },
  });

  const cabinetryCategory = await prisma.budgetCategory.upsert({
    where: {
      id: "scopehouse-demo-budget-category-cabinetry",
    },
    update: {
      projectId: project.id,
      label: "Cabinetry and millwork",
      notes: "Core kitchen storage and trim package.",
      status: "active",
      itemOrder: 0,
    },
    create: {
      id: "scopehouse-demo-budget-category-cabinetry",
      projectId: project.id,
      label: "Cabinetry and millwork",
      notes: "Core kitchen storage and trim package.",
      status: "active",
      itemOrder: 0,
    },
  });

  await prisma.budgetLine.upsert({
    where: {
      id: "scopehouse-demo-budget-line-cabinets",
    },
    update: {
      projectId: project.id,
      categoryId: cabinetryCategory.id,
      label: "Base and wall cabinets",
      estimateCents: 1800000,
      allowanceCents: 2000000,
      quotedCents: 2150000,
      actualCents: null,
      sourceReference: "Cabinet package rev A",
      notes: "Appliance panels still excluded.",
      itemOrder: 0,
    },
    create: {
      id: "scopehouse-demo-budget-line-cabinets",
      projectId: project.id,
      categoryId: cabinetryCategory.id,
      label: "Base and wall cabinets",
      estimateCents: 1800000,
      allowanceCents: 2000000,
      quotedCents: 2150000,
      actualCents: null,
      sourceReference: "Cabinet package rev A",
      notes: "Appliance panels still excluded.",
      itemOrder: 0,
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
