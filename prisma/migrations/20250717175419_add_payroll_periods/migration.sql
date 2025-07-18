-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('EN_INCIDENCIA', 'EN_REVISION', 'RECHAZADA', 'CERRADO');

-- CreateTable
CREATE TABLE "payroll_calendar_periods" (
    "id" SERIAL NOT NULL,
    "calendarId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'EN_INCIDENCIA',
    "prenominaFile" TEXT,
    "layoutsFile" TEXT,
    "rejectionReason" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_calendar_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_calendar_periods_calendarId_number_key" ON "payroll_calendar_periods"("calendarId", "number");

-- AddForeignKey
ALTER TABLE "payroll_calendar_periods" ADD CONSTRAINT "payroll_calendar_periods_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "payroll_calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
