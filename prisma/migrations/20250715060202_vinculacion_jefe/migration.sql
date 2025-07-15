/*
  Warnings:

  - You are about to drop the column `workerDetailsId` on the `incidences` table. All the data in the column will be lost.
  - You are about to drop the column `empleadoId` on the `vinculacion_jefe_empleados` table. All the data in the column will be lost.
  - You are about to drop the column `empleadoId` on the `vinculacion_jefes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vinculacionJefeId,workerDetailsId]` on the table `vinculacion_jefe_empleados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workerDetailsId]` on the table `vinculacion_jefes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `incidences` table without a default value. This is not possible if the table is not empty.
  - Made the column `workerDetailsId` on table `payroll_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `workerDetailsId` to the `vinculacion_jefe_empleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerDetailsId` to the `vinculacion_jefes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "incidences" DROP CONSTRAINT "incidences_workerDetailsId_fkey";

-- DropForeignKey
ALTER TABLE "vinculacion_jefe_empleados" DROP CONSTRAINT "vinculacion_jefe_empleados_empleadoId_fkey";

-- DropForeignKey
ALTER TABLE "vinculacion_jefes" DROP CONSTRAINT "vinculacion_jefes_empleadoId_fkey";

-- DropIndex
DROP INDEX "incidences_workerDetailsId_type_idx";

-- DropIndex
DROP INDEX "vinculacion_jefe_empleados_empleadoId_idx";

-- DropIndex
DROP INDEX "vinculacion_jefe_empleados_vinculacionJefeId_empleadoId_key";

-- DropIndex
DROP INDEX "vinculacion_jefes_empleadoId_key";

-- AlterTable
ALTER TABLE "incidences" DROP COLUMN "workerDetailsId",
ADD COLUMN     "employeeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payroll_items" ALTER COLUMN "workerDetailsId" SET NOT NULL;

-- AlterTable
ALTER TABLE "vinculacion_jefe_empleados" DROP COLUMN "empleadoId",
ADD COLUMN     "workerDetailsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "vinculacion_jefes" DROP COLUMN "empleadoId",
ADD COLUMN     "workerDetailsId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "incidences_employeeId_type_idx" ON "incidences"("employeeId", "type");

-- CreateIndex
CREATE INDEX "vinculacion_jefe_empleados_workerDetailsId_idx" ON "vinculacion_jefe_empleados"("workerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefe_empleados_vinculacionJefeId_workerDetailsI_key" ON "vinculacion_jefe_empleados"("vinculacionJefeId", "workerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefes_workerDetailsId_key" ON "vinculacion_jefes"("workerDetailsId");

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "worker_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefes" ADD CONSTRAINT "vinculacion_jefes_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_empleados" ADD CONSTRAINT "vinculacion_jefe_empleados_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
