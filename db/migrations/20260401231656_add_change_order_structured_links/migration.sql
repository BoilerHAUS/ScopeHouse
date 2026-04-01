-- AlterTable
ALTER TABLE "ChangeOrder" ADD COLUMN     "budgetLineId" TEXT,
ADD COLUMN     "scheduleMilestoneId" TEXT,
ADD COLUMN     "scopeItemId" TEXT;

-- CreateIndex
CREATE INDEX "ChangeOrder_scopeItemId_idx" ON "ChangeOrder"("scopeItemId");

-- CreateIndex
CREATE INDEX "ChangeOrder_budgetLineId_idx" ON "ChangeOrder"("budgetLineId");

-- CreateIndex
CREATE INDEX "ChangeOrder_scheduleMilestoneId_idx" ON "ChangeOrder"("scheduleMilestoneId");

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_scopeItemId_fkey" FOREIGN KEY ("scopeItemId") REFERENCES "ScopeItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES "BudgetLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_scheduleMilestoneId_fkey" FOREIGN KEY ("scheduleMilestoneId") REFERENCES "ScheduleMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
