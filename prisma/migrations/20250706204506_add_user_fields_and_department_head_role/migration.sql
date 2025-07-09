-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DEPARTMENT_HEAD';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoUrl" TEXT;
