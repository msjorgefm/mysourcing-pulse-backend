-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PeriodStatus" ADD VALUE 'EN_REVISION_PRENOMINA';
ALTER TYPE "PeriodStatus" ADD VALUE 'PRENOMINA_APROBADA';
ALTER TYPE "PeriodStatus" ADD VALUE 'PRENOMINA_RECHAZADA';

-- AlterTable
ALTER TABLE "payroll_calendar_periods" ADD COLUMN     "prenominaRejectionReason" TEXT;
