-- AlterTable
ALTER TABLE "company_banks" RENAME COLUMN "bankName" TO "nombreBanco";
ALTER TABLE "company_banks" RENAME COLUMN "accountNumber" TO "numCuentaBancaria";
ALTER TABLE "company_banks" RENAME COLUMN "isPrimary" TO "opcCuentaBancariaPrincipal";

-- Add new columns
ALTER TABLE "company_banks" ADD COLUMN "nomCuentaBancaria" TEXT;
ALTER TABLE "company_banks" ADD COLUMN "numClabeInterbancaria" VARCHAR(18);
ALTER TABLE "company_banks" ADD COLUMN "numSucursal" VARCHAR(6);
ALTER TABLE "company_banks" ADD COLUMN "clvDispersion" INTEGER;
ALTER TABLE "company_banks" ADD COLUMN "desCuentaBancaria" TEXT;

-- Update existing data
UPDATE "company_banks" 
SET "nomCuentaBancaria" = "numCuentaBancaria",
    "numClabeInterbancaria" = COALESCE("clabe", ''),
    "numSucursal" = '',
    "clvDispersion" = 0;

-- Make required columns NOT NULL after populating data
ALTER TABLE "company_banks" ALTER COLUMN "nomCuentaBancaria" SET NOT NULL;
ALTER TABLE "company_banks" ALTER COLUMN "numClabeInterbancaria" SET NOT NULL;
ALTER TABLE "company_banks" ALTER COLUMN "numSucursal" SET NOT NULL;
ALTER TABLE "company_banks" ALTER COLUMN "clvDispersion" SET NOT NULL;

-- Drop old columns
ALTER TABLE "company_banks" DROP COLUMN "bankType";
ALTER TABLE "company_banks" DROP COLUMN "clabe";

-- Add unique constraint
CREATE UNIQUE INDEX "company_banks_companyId_key" ON "company_banks"("companyId");