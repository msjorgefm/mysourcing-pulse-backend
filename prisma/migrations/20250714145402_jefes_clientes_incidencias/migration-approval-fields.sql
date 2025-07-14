-- Agregar campos a la tabla incidences
ALTER TABLE "incidences" 
ADD COLUMN IF NOT EXISTS "createdBy" TEXT DEFAULT 'CLIENT',
ADD COLUMN IF NOT EXISTS "createdByUserId" INTEGER,
ADD COLUMN IF NOT EXISTS "approvedBy" INTEGER,
ADD COLUMN IF NOT EXISTS "approvalDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Agregar campos a la tabla payrolls
ALTER TABLE "payrolls" 
ADD COLUMN IF NOT EXISTS "payrollCalendarId" INTEGER,
ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "clientApprovedBy" INTEGER,
ADD COLUMN IF NOT EXISTS "clientApprovalDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "clientRejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" INTEGER;

-- Agregar foreign keys
ALTER TABLE "incidences"
ADD CONSTRAINT "incidences_createdByUserId_fkey" 
FOREIGN KEY ("createdByUserId") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE "incidences"
ADD CONSTRAINT "incidences_approvedBy_fkey" 
FOREIGN KEY ("approvedBy") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE "payrolls"
ADD CONSTRAINT "payrolls_payrollCalendarId_fkey" 
FOREIGN KEY ("payrollCalendarId") 
REFERENCES "payroll_calendars"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE "payrolls"
ADD CONSTRAINT "payrolls_clientApprovedBy_fkey" 
FOREIGN KEY ("clientApprovedBy") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE "payrolls"
ADD CONSTRAINT "payrolls_createdBy_fkey" 
FOREIGN KEY ("createdBy") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Agregar índices
CREATE INDEX IF NOT EXISTS "incidences_companyId_status_createdBy_idx" ON "incidences"("companyId", "status", "createdBy");

-- Agregar nuevos valores a los enums de IncidenceType
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'INCENTIVOS';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'PRIMA_DOMINICAL';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'INCAPACIDADES';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'OTROS';

-- Agregar el nuevo enum PayrollApprovalStatus si no existe
DO $$ BEGIN
    CREATE TYPE "PayrollApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;