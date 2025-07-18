/*
  Warnings:

  - Added the required column `userId` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PERIOD_STATUS_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'PRENOMINA_UPLOADED';
ALTER TYPE "NotificationType" ADD VALUE 'LAYOUTS_UPLOADED';
ALTER TYPE "NotificationType" ADD VALUE 'INCIDENCE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'INCIDENCE_REJECTED';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "data" JSONB,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
