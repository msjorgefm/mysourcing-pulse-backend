-- AlterTable
ALTER TABLE "company_legal_representative" ADD COLUMN     "primerApellido" TEXT,
ADD COLUMN     "segundoApellido" TEXT,
ADD COLUMN     "tipoIdentificacionId" INTEGER,
ADD COLUMN     "uriIdentificacion" TEXT;

-- CreateTable
CREATE TABLE "cat_identification_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_identification_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_identification_types_code_key" ON "cat_identification_types"("code");

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_tipoIdentificacionId_fkey" FOREIGN KEY ("tipoIdentificacionId") REFERENCES "cat_identification_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
