/*
  Warnings:

  - You are about to drop the column `city` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `exteriorNumber` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `interiorNumber` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `legalRepCurp` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `legalRepName` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `legalRepPosition` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `legalRepRFC` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `notarialPower` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `notaryName` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `notaryNumber` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `company_general_info` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `company_general_info` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('ATTENDANCE', 'VACATION', 'REMOTE_WORK', 'CODE_OF_CONDUCT', 'OTHER');

-- AlterTable
ALTER TABLE "company_general_info" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "exteriorNumber",
DROP COLUMN "interiorNumber",
DROP COLUMN "legalRepCurp",
DROP COLUMN "legalRepName",
DROP COLUMN "legalRepPosition",
DROP COLUMN "legalRepRFC",
DROP COLUMN "neighborhood",
DROP COLUMN "notarialPower",
DROP COLUMN "notaryName",
DROP COLUMN "notaryNumber",
DROP COLUMN "state",
DROP COLUMN "street",
DROP COLUMN "zipCode";

-- CreateTable
CREATE TABLE "company_address" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "exteriorNumber" TEXT NOT NULL,
    "interiorNumber" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'México',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_legal_representative" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "curp" TEXT,
    "position" TEXT NOT NULL,
    "notarialPower" TEXT,
    "notaryNumber" TEXT,
    "notaryName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_legal_representative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_address_companyId_key" ON "company_address"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_legal_representative_companyId_key" ON "company_legal_representative"("companyId");

-- AddForeignKey
ALTER TABLE "company_address" ADD CONSTRAINT "company_address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policies" ADD CONSTRAINT "company_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
