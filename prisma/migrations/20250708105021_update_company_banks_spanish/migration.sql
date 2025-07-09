-- CreateTable
CREATE TABLE "cat_banks" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "nombreCorto" VARCHAR(50),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_banks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_banks_codigo_key" ON "cat_banks"("codigo");

-- AlterTable
ALTER TABLE "company_banks" ADD COLUMN "bankId" INTEGER;

-- UpdateTable: Migrate existing data to use bankId based on nombreBanco
UPDATE "company_banks" cb
SET "bankId" = b.id
FROM "cat_banks" b
WHERE cb."nombreBanco" = b."nombre" OR cb."nombreBanco" = b."nombreCorto";

-- MakeColumnRequired: Now make bankId required
ALTER TABLE "company_banks" ALTER COLUMN "bankId" SET NOT NULL;

-- DropColumn: Remove the old nombreBanco column
ALTER TABLE "company_banks" DROP COLUMN "nombreBanco";

-- AddForeignKey
ALTER TABLE "company_banks" ADD CONSTRAINT "company_banks_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "cat_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;