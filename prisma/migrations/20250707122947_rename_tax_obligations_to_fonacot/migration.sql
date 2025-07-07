-- AlterTable: Rename company_tax_obligations to fonacot
ALTER TABLE "company_tax_obligations" RENAME TO "fonacot";

-- AlterTable: Drop old columns
ALTER TABLE "fonacot" 
  DROP COLUMN IF EXISTS "imssAddress",
  DROP COLUMN IF EXISTS "imssCity",
  DROP COLUMN IF EXISTS "imssState",
  DROP COLUMN IF EXISTS "imssZipCode",
  DROP COLUMN IF EXISTS "fonacotCenter";

-- AlterTable: Rename fonacotRegistration to registroPatronal
ALTER TABLE "fonacot" 
  RENAME COLUMN "fonacotRegistration" TO "registroPatronal";

-- AlterTable: Modify registroPatronal to have max length 7
ALTER TABLE "fonacot" 
  ALTER COLUMN "registroPatronal" TYPE VARCHAR(7);

-- AlterTable: Add new columns
ALTER TABLE "fonacot"
  ADD COLUMN "fechaAfiliacion" TIMESTAMP(3),
  ADD COLUMN "uriArchivoFonacot" TEXT;