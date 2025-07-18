-- Agregar nuevos estados para el flujo de layouts bancarios
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'EN_REVISION_LAYOUTS';
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'LAYOUTS_APROBADOS';
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'LAYOUTS_RECHAZADOS';

-- Agregar columnas para el control de layouts
ALTER TABLE "payroll_calendar_periods" 
ADD COLUMN IF NOT EXISTS "layoutsRejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "layoutsApprovedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "layoutsApprovedBy" INTEGER,
ADD COLUMN IF NOT EXISTS "layoutsRejectedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "layoutsRejectedBy" INTEGER;

-- Agregar nuevos tipos de notificación para layouts
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LAYOUTS_REVIEW_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LAYOUTS_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LAYOUTS_REJECTED';