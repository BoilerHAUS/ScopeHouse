-- CreateEnum
CREATE TYPE "ContractorInvolvement" AS ENUM ('undecided', 'self_managed', 'hiring_gc', 'selected_gc', 'design_build');

-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('project_created', 'project_updated', 'intake_started', 'intake_saved', 'intake_completed');

-- CreateTable
CREATE TABLE "ProjectIntake" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "renovationType" "ProjectType",
    "rooms" JSONB,
    "goals" TEXT,
    "priorities" JSONB,
    "timingExpectation" TEXT,
    "budgetRange" TEXT,
    "constraints" JSONB,
    "contractorInvolvement" "ContractorInvolvement",
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "eventType" "ActivityEventType" NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectIntake_projectId_key" ON "ProjectIntake"("projectId");

-- CreateIndex
CREATE INDEX "ProjectIntake_completedAt_idx" ON "ProjectIntake"("completedAt");

-- CreateIndex
CREATE INDEX "ActivityLog_projectId_createdAt_idx" ON "ActivityLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_workspaceId_createdAt_idx" ON "ActivityLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_eventType_idx" ON "ActivityLog"("eventType");

-- AddForeignKey
ALTER TABLE "ProjectIntake" ADD CONSTRAINT "ProjectIntake_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
