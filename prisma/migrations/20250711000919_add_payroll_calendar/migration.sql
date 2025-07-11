-- DropForeignKey
ALTER TABLE "company_notarial_power" DROP CONSTRAINT "company_notarial_power_estadoId_fkey";

-- DropForeignKey
ALTER TABLE "company_notarial_power" DROP CONSTRAINT "company_notarial_power_municipioId_fkey";

-- CreateTable
CREATE TABLE "payroll_calendars" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "payFrequency" TEXT NOT NULL,
    "daysBeforeClose" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "periodNumber" INTEGER NOT NULL DEFAULT 1,
    "payNaturalDays" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_calendars_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payroll_calendars" ADD CONSTRAINT "payroll_calendars_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "cat_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "cat_municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
