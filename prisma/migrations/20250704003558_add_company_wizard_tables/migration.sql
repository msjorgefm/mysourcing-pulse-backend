-- CreateEnum
CREATE TYPE "WizardStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('CHECKING', 'SAVINGS', 'PAYROLL');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'DAYS', 'HOURS');

-- CreateTable
CREATE TABLE "company_wizards" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "status" "WizardStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentSection" INTEGER NOT NULL DEFAULT 1,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "wizardData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_wizard_sections" (
    "id" SERIAL NOT NULL,
    "wizardId" INTEGER NOT NULL,
    "sectionNumber" INTEGER NOT NULL,
    "sectionName" TEXT NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'PENDING',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizard_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_wizard_steps" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "stepData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizard_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_general_info" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "commercialName" TEXT,
    "rfc" TEXT NOT NULL,
    "taxRegime" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "street" TEXT NOT NULL,
    "exteriorNumber" TEXT NOT NULL,
    "interiorNumber" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'México',
    "legalRepName" TEXT NOT NULL,
    "legalRepRFC" TEXT NOT NULL,
    "legalRepCurp" TEXT,
    "legalRepPosition" TEXT NOT NULL,
    "notarialPower" TEXT,
    "notaryNumber" TEXT,
    "notaryName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_general_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_tax_obligations" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "imssRegistration" TEXT,
    "imssClassification" TEXT,
    "imssRiskClass" TEXT,
    "imssAddress" TEXT,
    "imssCity" TEXT,
    "imssState" TEXT,
    "imssZipCode" TEXT,
    "fonacotRegistration" TEXT,
    "fonacotCenter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_tax_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_banks" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankType" "BankType" NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "clabe" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_digital_certificates" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "certificateFile" TEXT NOT NULL,
    "keyFile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_digital_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_areas" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_departments" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_positions" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minSalary" DECIMAL(10,2),
    "maxSalary" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_benefits" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BenefitType" NOT NULL,
    "isLegal" BOOLEAN NOT NULL DEFAULT false,
    "percentage" DECIMAL(5,2),
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_benefit_groups" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "benefits" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_benefit_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_schedules" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakTime" INTEGER,
    "workDays" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_wizards_companyId_key" ON "company_wizards"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_wizard_sections_wizardId_sectionNumber_key" ON "company_wizard_sections"("wizardId", "sectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "company_wizard_steps_sectionId_stepNumber_key" ON "company_wizard_steps"("sectionId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "company_general_info_companyId_key" ON "company_general_info"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_tax_obligations_companyId_key" ON "company_tax_obligations"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_digital_certificates_companyId_key" ON "company_digital_certificates"("companyId");

-- AddForeignKey
ALTER TABLE "company_wizards" ADD CONSTRAINT "company_wizards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_wizard_sections" ADD CONSTRAINT "company_wizard_sections_wizardId_fkey" FOREIGN KEY ("wizardId") REFERENCES "company_wizards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_wizard_steps" ADD CONSTRAINT "company_wizard_steps_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "company_wizard_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_general_info" ADD CONSTRAINT "company_general_info_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_tax_obligations" ADD CONSTRAINT "company_tax_obligations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_banks" ADD CONSTRAINT "company_banks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_digital_certificates" ADD CONSTRAINT "company_digital_certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_areas" ADD CONSTRAINT "company_areas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_departments" ADD CONSTRAINT "company_departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_departments" ADD CONSTRAINT "company_departments_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "company_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_positions" ADD CONSTRAINT "company_positions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_positions" ADD CONSTRAINT "company_positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "company_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_benefits" ADD CONSTRAINT "company_benefits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_benefit_groups" ADD CONSTRAINT "company_benefit_groups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_schedules" ADD CONSTRAINT "company_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
