-- Agregar valores faltantes al enum NotificationType
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INCIDENCE_REVIEW_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PRENOMINA_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PRENOMINA_REJECTED';

-- Agregar valores faltantes al enum PeriodStatus
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'EN_REVISION_PRENOMINA';
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'PRENOMINA_APROBADA';
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'PRENOMINA_RECHAZADA';
ALTER TYPE "PeriodStatus" ADD VALUE IF NOT EXISTS 'FINALIZADO';

-- Agregar columnas faltantes a la tabla PayrollCalendarPeriod si no existen
DO $$ 
BEGIN
    -- Agregar prenominaRejectionReason si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payroll_calendar_periods' 
                   AND column_name = 'prenominaRejectionReason') THEN
        ALTER TABLE "payroll_calendar_periods" ADD COLUMN "prenominaRejectionReason" TEXT;
    END IF;

    -- Agregar prenominaApprovedAt si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payroll_calendar_periods' 
                   AND column_name = 'prenominaApprovedAt') THEN
        ALTER TABLE "payroll_calendar_periods" ADD COLUMN "prenominaApprovedAt" TIMESTAMP;
    END IF;

    -- Agregar prenominaApprovedBy si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payroll_calendar_periods' 
                   AND column_name = 'prenominaApprovedBy') THEN
        ALTER TABLE "payroll_calendar_periods" ADD COLUMN "prenominaApprovedBy" INTEGER;
    END IF;

    -- Agregar prenominaRejectedAt si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payroll_calendar_periods' 
                   AND column_name = 'prenominaRejectedAt') THEN
        ALTER TABLE "payroll_calendar_periods" ADD COLUMN "prenominaRejectedAt" TIMESTAMP;
    END IF;

    -- Agregar prenominaRejectedBy si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payroll_calendar_periods' 
                   AND column_name = 'prenominaRejectedBy') THEN
        ALTER TABLE "payroll_calendar_periods" ADD COLUMN "prenominaRejectedBy" INTEGER;
    END IF;
END $$;