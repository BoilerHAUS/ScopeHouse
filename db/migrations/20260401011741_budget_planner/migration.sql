-- CreateEnum
CREATE TYPE "BudgetCategoryStatus" AS ENUM ('draft', 'active');

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "status" "BudgetCategoryStatus" NOT NULL DEFAULT 'active',
    "itemOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "scopeItemId" TEXT,
    "label" TEXT NOT NULL,
    "estimateCents" INTEGER,
    "allowanceCents" INTEGER,
    "quotedCents" INTEGER,
    "actualCents" INTEGER,
    "sourceReference" TEXT,
    "notes" TEXT,
    "itemOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetCategory_projectId_itemOrder_idx" ON "BudgetCategory"("projectId", "itemOrder");

-- CreateIndex
CREATE INDEX "BudgetCategory_status_idx" ON "BudgetCategory"("status");

-- CreateIndex
CREATE INDEX "BudgetLine_projectId_categoryId_itemOrder_idx" ON "BudgetLine"("projectId", "categoryId", "itemOrder");

-- CreateIndex
CREATE INDEX "BudgetLine_scopeItemId_idx" ON "BudgetLine"("scopeItemId");

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_scopeItemId_fkey" FOREIGN KEY ("scopeItemId") REFERENCES "ScopeItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
