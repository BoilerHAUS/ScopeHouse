-- CreateEnum
CREATE TYPE "ChangeOrderStatus" AS ENUM ('proposed', 'approved', 'rejected', 'implemented');

-- CreateTable
CREATE TABLE "ChangeOrder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ChangeOrderStatus" NOT NULL DEFAULT 'proposed',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "impactSummary" TEXT NOT NULL,
    "budgetReference" TEXT,
    "scheduleReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChangeOrder_projectId_requestedAt_idx" ON "ChangeOrder"("projectId", "requestedAt");

-- CreateIndex
CREATE INDEX "ChangeOrder_status_idx" ON "ChangeOrder"("status");

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
