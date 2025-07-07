-- AlterTable
ALTER TABLE "company_general_info" 
ADD COLUMN IF NOT EXISTS "tipoPersona" TEXT,
ADD COLUMN IF NOT EXISTS "actividadEconomica" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "cat_tax_regimes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tipoPersona" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tax_regimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cat_economic_activities" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_economic_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cat_tax_regimes_code_key" ON "cat_tax_regimes"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cat_economic_activities_code_key" ON "cat_economic_activities"("code");