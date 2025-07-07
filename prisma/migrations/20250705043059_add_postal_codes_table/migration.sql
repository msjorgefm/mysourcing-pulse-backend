-- CreateTable
CREATE TABLE "cat_postal_codes" (
    "id" SERIAL NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'México',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cat_postal_codes_postalCode_idx" ON "cat_postal_codes"("postalCode");
