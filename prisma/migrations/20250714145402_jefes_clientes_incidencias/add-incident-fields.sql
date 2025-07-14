-- Add payrollCalendarId and periodId to Incidence table
ALTER TABLE "incidences" 
ADD COLUMN "payrollCalendarId" INTEGER,
ADD COLUMN "periodId" VARCHAR(255);

-- Add foreign key constraint
ALTER TABLE "incidences"
ADD CONSTRAINT "incidences_payrollCalendarId_fkey" 
FOREIGN KEY ("payrollCalendarId") 
REFERENCES "payroll_calendars"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add new incident types to enum
ALTER TYPE "IncidenceType" ADD VALUE 'INCENTIVOS';
ALTER TYPE "IncidenceType" ADD VALUE 'PRIMA_DOMINICAL';
ALTER TYPE "IncidenceType" ADD VALUE 'INCAPACIDADES';
ALTER TYPE "IncidenceType" ADD VALUE 'OTROS';