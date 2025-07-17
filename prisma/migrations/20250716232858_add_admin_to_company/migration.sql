-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "managedByAdminId" INTEGER;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_managedByAdminId_fkey" FOREIGN KEY ("managedByAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
