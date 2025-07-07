-- CreateTable
CREATE TABLE "company_notarial_power" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "folioPoderNotarial" VARCHAR(25) NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "nombreFederatario" TEXT NOT NULL,
    "numeroFederatario" INTEGER NOT NULL,
    "estadoId" INTEGER NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "uriPoderNotarial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_notarial_power_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_notarial_power_companyId_key" ON "company_notarial_power"("companyId");

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "cat_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "cat_municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate data from company_legal_representative to company_notarial_power
INSERT INTO "company_notarial_power" (
    "companyId",
    "folioPoderNotarial",
    "fechaEmision",
    "fechaVigencia",
    "nombreFederatario",
    "numeroFederatario",
    "estadoId",
    "municipioId",
    "uriPoderNotarial",
    "createdAt",
    "updatedAt"
)
SELECT 
    "companyId",
    "folioPoderNotarial",
    "fechaEmision",
    "fechaVigencia",
    "nombreFederatario",
    "numeroFederatario",
    "estadoId",
    "municipioId",
    "uriPoderNotarial",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "company_legal_representative"
WHERE "folioPoderNotarial" IS NOT NULL
AND "estadoId" IS NOT NULL
AND "municipioId" IS NOT NULL;

-- AlterTable
ALTER TABLE "company_legal_representative" DROP COLUMN "estadoId",
DROP COLUMN "fechaEmision",
DROP COLUMN "fechaVigencia",
DROP COLUMN "folioPoderNotarial",
DROP COLUMN "municipioId",
DROP COLUMN "nombreFederatario",
DROP COLUMN "numeroFederatario",
DROP COLUMN "uriPoderNotarial";