/*
  Warnings:

  - You are about to drop the column `notaryName` on the `company_legal_representative` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company_legal_representative" DROP COLUMN "notaryName",
ADD COLUMN     "estadoId" INTEGER,
ADD COLUMN     "fechaEmision" TIMESTAMP(3),
ADD COLUMN     "fechaVigencia" TIMESTAMP(3),
ADD COLUMN     "folioPoderNotarial" VARCHAR(25),
ADD COLUMN     "municipioId" INTEGER,
ADD COLUMN     "nombreFederatario" TEXT,
ADD COLUMN     "numeroFederatario" INTEGER,
ADD COLUMN     "uriPoderNotarial" TEXT;

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "cat_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "cat_municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
