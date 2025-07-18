-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PRENOMINA_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'PRENOMINA_REJECTED';

-- AlterTable
ALTER TABLE "payroll_calendar_periods" ADD COLUMN     "prenominaApprovedAt" TIMESTAMP(3),
ADD COLUMN     "prenominaApprovedBy" INTEGER,
ADD COLUMN     "prenominaRejectedAt" TIMESTAMP(3),
ADD COLUMN     "prenominaRejectedBy" INTEGER;
