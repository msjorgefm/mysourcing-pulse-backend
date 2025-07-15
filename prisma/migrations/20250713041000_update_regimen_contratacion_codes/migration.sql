-- Update existing codes from numbers to descriptive names
UPDATE "cat_regimen_contratacion" SET "codigo" = 'SUELDOS' WHERE "codigo" = '1';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'JUBILADOS' WHERE "codigo" = '2';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_COOPERATIVAS' WHERE "codigo" = '3';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_SOCIEDADES' WHERE "codigo" = '4';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_CONSEJOS' WHERE "codigo" = '5';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_COMISIONISTAS' WHERE "codigo" = '6';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_HONORARIOS' WHERE "codigo" = '7';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_ACCIONES' WHERE "codigo" = '8';
UPDATE "cat_regimen_contratacion" SET "codigo" = 'ASIMILADOS_OTROS' WHERE "codigo" = '9';

-- Migration: Remove Employee Model and Restructure Database

-- Step 1: Add new columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "workerDetailsId" INTEGER;

-- Step 2: Copy name to username
UPDATE "users" SET "username" = "name" WHERE "username" IS NULL;

-- Step 3: Check if worker_details has employeeId before using it
DO $$
BEGIN
    -- Check if employeeId column exists in worker_details
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'worker_details' AND column_name = 'employeeId') THEN
        -- Step 4: Update incidences table
        ALTER TABLE "incidences" ADD COLUMN IF NOT EXISTS "workerDetailsId" INTEGER;
        
        -- Migrate data from employeeId to workerDetailsId using worker_details mapping
        UPDATE "incidences" i 
        SET "workerDetailsId" = wd.id 
        FROM "worker_details" wd 
        WHERE i."employeeId" = wd."employeeId";
        
        -- Step 5: Update payroll_items table
        ALTER TABLE "payroll_items" ADD COLUMN IF NOT EXISTS "workerDetailsId" INTEGER;
        
        -- Migrate data from employeeId to workerDetailsId using worker_details mapping
        UPDATE "payroll_items" pi 
        SET "workerDetailsId" = wd.id 
        FROM "worker_details" wd 
        WHERE pi."employeeId" = wd."employeeId";
        
        -- Step 6: Update users table to link with worker_details
        UPDATE "users" u 
        SET "workerDetailsId" = wd.id 
        FROM "worker_details" wd 
        WHERE u."employeeId" = wd."employeeId";
    END IF;
END $$;

-- Step 7: Remove fotografia from worker_details
ALTER TABLE "worker_details" DROP COLUMN IF EXISTS "fotografia";

-- Step 8: Drop employeeId from worker_details if it exists
ALTER TABLE "worker_details" DROP COLUMN IF EXISTS "employeeId";

-- Step 9: Drop the old employeeId columns from other tables
ALTER TABLE "incidences" DROP COLUMN IF EXISTS "employeeId";
ALTER TABLE "payroll_items" DROP COLUMN IF EXISTS "employeeId";

-- Step 10: Drop columns from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "employeeId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "users" DROP COLUMN IF EXISTS "lastName";
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";

-- Step 11: Drop employees table
DROP TABLE IF EXISTS "employees";

-- Step 12: Add constraints (drop first if they exist)
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_workerDetailsId_key";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_workerDetailsId_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_workerDetailsId_key" UNIQUE ("workerDetailsId");
ALTER TABLE "users" ADD CONSTRAINT "users_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update unique constraints for payroll_items
ALTER TABLE "payroll_items" DROP CONSTRAINT IF EXISTS "payroll_items_employeeId_payrollId_key";
ALTER TABLE "payroll_items" DROP CONSTRAINT IF EXISTS "payroll_items_workerDetailsId_payrollId_key";
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_workerDetailsId_payrollId_key" UNIQUE ("workerDetailsId", "payrollId");

-- Add foreign key constraints (drop first if they exist)
ALTER TABLE "incidences" DROP CONSTRAINT IF EXISTS "incidences_workerDetailsId_fkey";
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payroll_items" DROP CONSTRAINT IF EXISTS "payroll_items_workerDetailsId_fkey";
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes
DROP INDEX IF EXISTS "incidences_workerDetailsId_type_idx";
CREATE INDEX "incidences_workerDetailsId_type_idx" ON "incidences"("workerDetailsId", "type");