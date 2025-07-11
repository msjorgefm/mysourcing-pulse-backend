-- AlterTable
ALTER TABLE "users" ADD COLUMN     "setupToken" TEXT,
ADD COLUMN     "setupTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_setupToken_key" ON "users"("setupToken");