-- AlterTable
ALTER TABLE "users" ADD COLUMN     "managedByAdminId" INTEGER;

-- CreateTable
CREATE TABLE "operator_companies" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "operator_companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operator_companies_operatorId_idx" ON "operator_companies"("operatorId");

-- CreateIndex
CREATE INDEX "operator_companies_companyId_idx" ON "operator_companies"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "operator_companies_operatorId_companyId_key" ON "operator_companies"("operatorId", "companyId");

-- CreateIndex
CREATE INDEX "users_managedByAdminId_idx" ON "users"("managedByAdminId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managedByAdminId_fkey" FOREIGN KEY ("managedByAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_companies" ADD CONSTRAINT "operator_companies_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_companies" ADD CONSTRAINT "operator_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_companies" ADD CONSTRAINT "operator_companies_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
