-- CreateEnum
CREATE TYPE "IncidenceCategory" AS ENUM ('DEDUCCION', 'PERCEPCION');

-- AlterTable
ALTER TABLE "incidences" ADD COLUMN     "customTypeId" INTEGER,
ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "company_incidence_types" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "IncidenceCategory" NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_incidence_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_incidence_templates" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "headerRow" INTEGER NOT NULL DEFAULT 1,
    "mappings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_incidence_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_incidence_types_companyId_activo_idx" ON "company_incidence_types"("companyId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "company_incidence_types_companyId_codigo_key" ON "company_incidence_types"("companyId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "company_incidence_templates_companyId_key" ON "company_incidence_templates"("companyId");

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_customTypeId_fkey" FOREIGN KEY ("customTypeId") REFERENCES "company_incidence_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_incidence_types" ADD CONSTRAINT "company_incidence_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_incidence_templates" ADD CONSTRAINT "company_incidence_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
