-- CreateEnum
CREATE TYPE "ScopeItemStatus" AS ENUM ('draft', 'active', 'needs_info');

-- CreateEnum
CREATE TYPE "ScopeItemSource" AS ENUM ('manual', 'ai_draft');

-- CreateEnum
CREATE TYPE "ScopeDraftStatus" AS ENUM ('pending_review', 'applied', 'discarded');

-- CreateEnum
CREATE TYPE "AiWorkflow" AS ENUM ('scope_draft', 'quote_compare', 'progress_summary');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('running', 'completed', 'failed');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityEventType" ADD VALUE 'scope_draft_generated';
ALTER TYPE "ActivityEventType" ADD VALUE 'scope_draft_applied';

-- CreateTable
CREATE TABLE "ScopeDraft" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "generationId" TEXT,
    "projectSummary" TEXT NOT NULL,
    "phases" JSONB NOT NULL,
    "assumptions" JSONB,
    "risks" JSONB,
    "status" "ScopeDraftStatus" NOT NULL DEFAULT 'pending_review',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScopeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScopeItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "appliedFromDraftId" TEXT,
    "phaseName" TEXT NOT NULL,
    "phaseOrder" INTEGER NOT NULL,
    "areaName" TEXT NOT NULL,
    "areaOrder" INTEGER NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ScopeItemStatus" NOT NULL DEFAULT 'draft',
    "source" "ScopeItemSource" NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScopeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "workflow" "AiWorkflow" NOT NULL,
    "status" "AiGenerationStatus" NOT NULL DEFAULT 'running',
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "outputObject" JSONB,
    "errorMessage" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScopeDraft_generationId_key" ON "ScopeDraft"("generationId");

-- CreateIndex
CREATE INDEX "ScopeDraft_projectId_createdAt_idx" ON "ScopeDraft"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ScopeDraft_status_idx" ON "ScopeDraft"("status");

-- CreateIndex
CREATE INDEX "ScopeItem_projectId_phaseOrder_areaOrder_itemOrder_idx" ON "ScopeItem"("projectId", "phaseOrder", "areaOrder", "itemOrder");

-- CreateIndex
CREATE INDEX "ScopeItem_appliedFromDraftId_idx" ON "ScopeItem"("appliedFromDraftId");

-- CreateIndex
CREATE INDEX "ScopeItem_status_idx" ON "ScopeItem"("status");

-- CreateIndex
CREATE INDEX "AiGeneration_projectId_createdAt_idx" ON "AiGeneration"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AiGeneration_workflow_createdAt_idx" ON "AiGeneration"("workflow", "createdAt");

-- CreateIndex
CREATE INDEX "AiGeneration_status_idx" ON "AiGeneration"("status");

-- AddForeignKey
ALTER TABLE "ScopeDraft" ADD CONSTRAINT "ScopeDraft_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeDraft" ADD CONSTRAINT "ScopeDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeItem" ADD CONSTRAINT "ScopeItem_appliedFromDraftId_fkey" FOREIGN KEY ("appliedFromDraftId") REFERENCES "ScopeDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeItem" ADD CONSTRAINT "ScopeItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
