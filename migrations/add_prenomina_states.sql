-- Agregar nuevos estados para el flujo de prenómina
ALTER TYPE "PeriodStatus" ADD VALUE 'EN_REVISION_PRENOMINA';
ALTER TYPE "PeriodStatus" ADD VALUE 'PRENOMINA_APROBADA';
ALTER TYPE "PeriodStatus" ADD VALUE 'PRENOMINA_RECHAZADA';

-- Agregar campo para comentarios de rechazo de prenómina
ALTER TABLE "payroll_calendar_periods" 
ADD COLUMN "prenominaRejectionReason" TEXT;