-- CreateEnum
CREATE TYPE "PayrollApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IncidenceType" ADD VALUE 'INCENTIVOS';
ALTER TYPE "IncidenceType" ADD VALUE 'PRIMA_DOMINICAL';
ALTER TYPE "IncidenceType" ADD VALUE 'INCAPACIDADES';
ALTER TYPE "IncidenceType" ADD VALUE 'OTROS';

-- AlterTable
ALTER TABLE "incidences" ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvedBy" INTEGER,
ADD COLUMN     "createdBy" "UserRole" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "createdByUserId" INTEGER,
ADD COLUMN     "payrollCalendarId" INTEGER,
ADD COLUMN     "periodId" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "payrolls" ADD COLUMN     "approvalStatus" "PayrollApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "clientApprovalDate" TIMESTAMP(3),
ADD COLUMN     "clientApprovedBy" INTEGER,
ADD COLUMN     "clientRejectionReason" TEXT,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "payrollCalendarId" INTEGER;

-- CreateIndex
CREATE INDEX "incidences_payrollCalendarId_periodId_idx" ON "incidences"("payrollCalendarId", "periodId");

-- CreateIndex
CREATE INDEX "incidences_companyId_status_createdBy_idx" ON "incidences"("companyId", "status", "createdBy");

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_payrollCalendarId_fkey" FOREIGN KEY ("payrollCalendarId") REFERENCES "payroll_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_clientApprovedBy_fkey" FOREIGN KEY ("clientApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_payrollCalendarId_fkey" FOREIGN KEY ("payrollCalendarId") REFERENCES "payroll_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
