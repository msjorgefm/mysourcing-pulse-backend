-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPERATOR', 'CLIENT', 'EMPLOYEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('IN_SETUP', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDEFINITE', 'FIXED_TERM', 'PART_TIME', 'CONTRACTOR', 'INTERN');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'PENDING_AUTHORIZATION', 'AUTHORIZED', 'PROCESSED', 'TIMBERED', 'ERROR');

-- CreateEnum
CREATE TYPE "CFDIStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "IncidenceType" AS ENUM ('FALTAS', 'PERMISOS', 'VACACIONES', 'TIEMPO_EXTRA', 'BONOS');

-- CreateEnum
CREATE TYPE "IncidenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYROLL_PENDING_AUTHORIZATION', 'PAYROLL_APPROVED', 'PAYROLL_REJECTED', 'PAYROLL_TIMBERED', 'SYSTEM_ALERT', 'REMINDER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'IN_SETUP',
    "employeesCount" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "bankAccount" TEXT,
    "taxRegime" TEXT,
    "certificateFile" TEXT,
    "keyFile" TEXT,
    "certificatePassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rfc" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "hireDate" TIMESTAMP(3) NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "workSchedule" TEXT,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "phone" TEXT,
    "emergencyContact" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "clabe" TEXT,
    "taxRegime" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendars" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "workDays" JSONB NOT NULL,
    "holidays" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "totalGross" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "totalNet" DECIMAL(12,2) NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "authorizedBy" TEXT,
    "xmlPath" TEXT,
    "pdfPath" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" SERIAL NOT NULL,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "overtime" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonuses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalGross" DECIMAL(10,2) NOT NULL,
    "incomeTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "socialSecurity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "workedDays" INTEGER NOT NULL,
    "cfdiStatus" "CFDIStatus" NOT NULL DEFAULT 'PENDING',
    "cfdiUuid" TEXT,
    "cfdiXmlPath" TEXT,
    "cfdiPdfPath" TEXT,
    "employeeId" INTEGER NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidences" (
    "id" SERIAL NOT NULL,
    "type" "IncidenceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "status" "IncidenceStatus" NOT NULL DEFAULT 'PENDING',
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "payrollId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "companyId" INTEGER,
    "payrollId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_email_isActive_idx" ON "users"("email", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "companies_rfc_key" ON "companies"("rfc");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_rfc_key" ON "employees"("rfc");

-- CreateIndex
CREATE INDEX "employees_companyId_status_idx" ON "employees"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "calendars_companyId_year_key" ON "calendars"("companyId", "year");

-- CreateIndex
CREATE INDEX "payrolls_companyId_status_idx" ON "payrolls"("companyId", "status");

-- CreateIndex
CREATE INDEX "payrolls_periodStart_periodEnd_idx" ON "payrolls"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_items_employeeId_payrollId_key" ON "payroll_items"("employeeId", "payrollId");

-- CreateIndex
CREATE INDEX "incidences_companyId_date_idx" ON "incidences"("companyId", "date");

-- CreateIndex
CREATE INDEX "incidences_employeeId_type_idx" ON "incidences"("employeeId", "type");

-- CreateIndex
CREATE INDEX "notifications_companyId_read_idx" ON "notifications"("companyId", "read");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;
