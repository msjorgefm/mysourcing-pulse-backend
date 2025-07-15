/*
  Warnings:

  - Made the column `contractType` on table `employees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "contractType" SET NOT NULL;

-- CreateTable
CREATE TABLE "cat_regimen_contratacion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_regimen_contratacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_regimen_contratacion_codigo_key" ON "cat_regimen_contratacion"("codigo");
