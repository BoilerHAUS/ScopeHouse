-- CreateTable
CREATE TABLE "SchedulePhase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "targetStartDate" TEXT,
    "targetEndDate" TEXT,
    "itemOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchedulePhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "targetDate" TEXT,
    "itemOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchedulePhase_projectId_itemOrder_idx" ON "SchedulePhase"("projectId", "itemOrder");

-- CreateIndex
CREATE INDEX "ScheduleMilestone_projectId_phaseId_itemOrder_idx" ON "ScheduleMilestone"("projectId", "phaseId", "itemOrder");

-- CreateIndex
CREATE INDEX "ScheduleMilestone_phaseId_itemOrder_idx" ON "ScheduleMilestone"("phaseId", "itemOrder");

-- AddForeignKey
ALTER TABLE "SchedulePhase" ADD CONSTRAINT "SchedulePhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMilestone" ADD CONSTRAINT "ScheduleMilestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "SchedulePhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMilestone" ADD CONSTRAINT "ScheduleMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
