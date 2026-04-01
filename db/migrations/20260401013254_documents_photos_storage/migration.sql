-- CreateTable
CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPhoto" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "caption" TEXT,
    "roomTag" TEXT,
    "phaseTag" TEXT,
    "takenOn" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDocument_storageKey_key" ON "ProjectDocument"("storageKey");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_createdAt_idx" ON "ProjectDocument"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectDocument_createdById_idx" ON "ProjectDocument"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPhoto_storageKey_key" ON "ProjectPhoto"("storageKey");

-- CreateIndex
CREATE INDEX "ProjectPhoto_projectId_uploadedAt_idx" ON "ProjectPhoto"("projectId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ProjectPhoto_createdById_idx" ON "ProjectPhoto"("createdById");

-- CreateIndex
CREATE INDEX "ProjectPhoto_roomTag_idx" ON "ProjectPhoto"("roomTag");

-- CreateIndex
CREATE INDEX "ProjectPhoto_phaseTag_idx" ON "ProjectPhoto"("phaseTag");

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhoto" ADD CONSTRAINT "ProjectPhoto_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhoto" ADD CONSTRAINT "ProjectPhoto_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
