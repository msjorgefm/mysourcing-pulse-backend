-- AlterTable
ALTER TABLE "company_address" ADD COLUMN "tipoDomicilio" TEXT NOT NULL DEFAULT 'matriz';
ALTER TABLE "company_address" ADD COLUMN "nombreSucursal" TEXT NOT NULL DEFAULT 'Matriz';
ALTER TABLE "company_address" ADD COLUMN "municipio" TEXT;

-- Update existing rows with a default value for nombreSucursal
UPDATE "company_address" SET "nombreSucursal" = 'Matriz' WHERE "nombreSucursal" IS NULL;

-- Remove the default after updating existing rows
ALTER TABLE "company_address" ALTER COLUMN "nombreSucursal" DROP DEFAULT;

-- DropColumn
ALTER TABLE "company_address" DROP COLUMN "country";