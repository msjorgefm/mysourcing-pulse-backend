-- CreateTable
CREATE TABLE "cat_municipios" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_ciudades" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "municipioCode" TEXT NOT NULL,
    "stateCode" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_colonias" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "cityName" TEXT NOT NULL,
    "municipioCode" TEXT NOT NULL,
    "stateCode" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_colonias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_municipios_code_key" ON "cat_municipios"("code");

-- CreateIndex
CREATE INDEX "cat_municipios_stateCode_idx" ON "cat_municipios"("stateCode");

-- CreateIndex
CREATE INDEX "cat_ciudades_municipioCode_idx" ON "cat_ciudades"("municipioCode");

-- CreateIndex
CREATE INDEX "cat_ciudades_stateCode_idx" ON "cat_ciudades"("stateCode");

-- CreateIndex
CREATE INDEX "cat_colonias_postalCode_idx" ON "cat_colonias"("postalCode");

-- CreateIndex
CREATE INDEX "cat_colonias_cityName_idx" ON "cat_colonias"("cityName");

-- CreateIndex
CREATE INDEX "cat_colonias_municipioCode_idx" ON "cat_colonias"("municipioCode");

-- CreateIndex
CREATE INDEX "cat_colonias_stateCode_idx" ON "cat_colonias"("stateCode");

-- AddForeignKey
ALTER TABLE "cat_municipios" ADD CONSTRAINT "cat_municipios_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "cat_states"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_ciudades" ADD CONSTRAINT "cat_ciudades_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_ciudades" ADD CONSTRAINT "cat_ciudades_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "cat_states"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_colonias" ADD CONSTRAINT "cat_colonias_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_colonias" ADD CONSTRAINT "cat_colonias_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "cat_states"("code") ON DELETE RESTRICT ON UPDATE CASCADE;