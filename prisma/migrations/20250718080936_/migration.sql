-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LAYOUTS_REVIEW_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'LAYOUTS_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'LAYOUTS_REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PeriodStatus" ADD VALUE 'EN_REVISION_LAYOUTS';
ALTER TYPE "PeriodStatus" ADD VALUE 'LAYOUTS_APROBADOS';
ALTER TYPE "PeriodStatus" ADD VALUE 'LAYOUTS_RECHAZADOS';

-- AlterTable
ALTER TABLE "payroll_calendar_periods" ADD COLUMN     "layoutsApprovedAt" TIMESTAMP(3),
ADD COLUMN     "layoutsApprovedBy" INTEGER,
ADD COLUMN     "layoutsRejectedAt" TIMESTAMP(3),
ADD COLUMN     "layoutsRejectedBy" INTEGER,
ADD COLUMN     "layoutsRejectionReason" TEXT;
