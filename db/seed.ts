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
import { writeProjectFileBuffer } from "@/server/storage/project-files";

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

  const planningPhase = await prisma.schedulePhase.upsert({
    where: {
      id: "scopehouse-demo-schedule-phase-planning",
    },
    update: {
      projectId: project.id,
      name: "Planning and selections",
      notes: "Finalize key owner-facing selections before contractor pricing.",
      targetStartDate: "2026-04-01",
      targetEndDate: "2026-04-30",
      itemOrder: 0,
    },
    create: {
      id: "scopehouse-demo-schedule-phase-planning",
      projectId: project.id,
      name: "Planning and selections",
      notes: "Finalize key owner-facing selections before contractor pricing.",
      targetStartDate: "2026-04-01",
      targetEndDate: "2026-04-30",
      itemOrder: 0,
    },
  });

  await prisma.schedulePhase.upsert({
    where: {
      id: "scopehouse-demo-schedule-phase-construction",
    },
    update: {
      projectId: project.id,
      name: "Construction",
      notes: "Coordinate demolition, install, and finish sequencing.",
      targetStartDate: "2026-05-06",
      targetEndDate: "2026-07-10",
      itemOrder: 1,
    },
    create: {
      id: "scopehouse-demo-schedule-phase-construction",
      projectId: project.id,
      name: "Construction",
      notes: "Coordinate demolition, install, and finish sequencing.",
      targetStartDate: "2026-05-06",
      targetEndDate: "2026-07-10",
      itemOrder: 1,
    },
  });

  await prisma.scheduleMilestone.upsert({
    where: {
      id: "scopehouse-demo-milestone-appliances",
    },
    update: {
      projectId: project.id,
      phaseId: planningPhase.id,
      label: "Lock appliance selections",
      notes: "Needed before cabinet shop drawings can be finalized.",
      targetDate: "2026-04-18",
      itemOrder: 0,
    },
    create: {
      id: "scopehouse-demo-milestone-appliances",
      projectId: project.id,
      phaseId: planningPhase.id,
      label: "Lock appliance selections",
      notes: "Needed before cabinet shop drawings can be finalized.",
      targetDate: "2026-04-18",
      itemOrder: 0,
    },
  });

  const documentStorageKey =
    "project-files/documents/scopehouse-demo-project/demo-kitchen-notes.txt";
  const photoStorageKey =
    "project-files/photos/scopehouse-demo-project/demo-existing-conditions.png";
  const documentContents = [
    "ScopeHouse demo planning notes",
    "",
    "- Confirm appliance selections before cabinetry pricing",
    "- Verify pantry shelving depth against circulation",
    "- Keep one side of the kitchen usable during construction",
  ].join("\n");
  const photoBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sXnVfQAAAAASUVORK5CYII=",
    "base64",
  );

  await writeProjectFileBuffer(
    documentStorageKey,
    new TextEncoder().encode(documentContents),
  );

  await writeProjectFileBuffer(photoStorageKey, photoBytes);

  await prisma.projectDocument.upsert({
    where: {
      storageKey: documentStorageKey,
    },
    update: {
      projectId: project.id,
      createdById: user.id,
      originalName: "demo-kitchen-notes.txt",
      contentType: "text/plain",
      sizeBytes: new TextEncoder().encode(documentContents).byteLength,
      tags: ["planning", "notes", "kitchen"],
    },
    create: {
      projectId: project.id,
      createdById: user.id,
      originalName: "demo-kitchen-notes.txt",
      storageKey: documentStorageKey,
      contentType: "text/plain",
      sizeBytes: new TextEncoder().encode(documentContents).byteLength,
      tags: ["planning", "notes", "kitchen"],
    },
  });

  await prisma.projectPhoto.upsert({
    where: {
      storageKey: photoStorageKey,
    },
    update: {
      projectId: project.id,
      createdById: user.id,
      originalName: "demo-existing-conditions.png",
      contentType: "image/png",
      sizeBytes: photoBytes.byteLength,
      caption: "Existing cabinet wall before scope lock.",
      roomTag: "Kitchen",
      phaseTag: "Existing conditions",
      takenOn: "2026-03-20",
    },
    create: {
      projectId: project.id,
      createdById: user.id,
      originalName: "demo-existing-conditions.png",
      storageKey: photoStorageKey,
      contentType: "image/png",
      sizeBytes: photoBytes.byteLength,
      caption: "Existing cabinet wall before scope lock.",
      roomTag: "Kitchen",
      phaseTag: "Existing conditions",
      takenOn: "2026-03-20",
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
