-- CreateTable for IMSS Delegaciones
CREATE TABLE "cat_imss_delegaciones" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "entidadFederativaCode" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_imss_delegaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable for IMSS Subdelegaciones
CREATE TABLE "cat_imss_subdelegaciones" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "delegacionId" INTEGER NOT NULL,
    "municipioCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_imss_subdelegaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable for IMSS Origen Movimiento
CREATE TABLE "cat_imss_origen_movimiento" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_imss_origen_movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable for IMSS Domicilio (campos adicionales del formulario IMSS)
CREATE TABLE "imss_domicilio" (
    "id" SERIAL NOT NULL,
    "imssRegistroPatronalId" INTEGER NOT NULL,
    "usarDomicilioMatriz" BOOLEAN NOT NULL DEFAULT false,
    "codigoPostal" VARCHAR(5),
    "entidadFederativaCode" VARCHAR(3),
    "municipioCode" TEXT,
    "localidad" TEXT,
    "coloniaId" INTEGER,
    "delegacionId" INTEGER,
    "subdelegacionId" INTEGER,
    "calle" VARCHAR(100),
    "numeroExterior" VARCHAR(10),
    "origenMovimientoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imss_domicilio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_delegaciones_codigo_key" ON "cat_imss_delegaciones"("codigo");
CREATE INDEX "cat_imss_delegaciones_entidadFederativaCode_idx" ON "cat_imss_delegaciones"("entidadFederativaCode");

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_subdelegaciones_codigo_key" ON "cat_imss_subdelegaciones"("codigo");
CREATE INDEX "cat_imss_subdelegaciones_delegacionId_idx" ON "cat_imss_subdelegaciones"("delegacionId");
CREATE INDEX "cat_imss_subdelegaciones_municipioCode_idx" ON "cat_imss_subdelegaciones"("municipioCode");

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_origen_movimiento_codigo_key" ON "cat_imss_origen_movimiento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "imss_domicilio_imssRegistroPatronalId_key" ON "imss_domicilio"("imssRegistroPatronalId");

-- AddForeignKey
ALTER TABLE "cat_imss_delegaciones" ADD CONSTRAINT "cat_imss_delegaciones_entidadFederativaCode_fkey" FOREIGN KEY ("entidadFederativaCode") REFERENCES "cat_states"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_imss_subdelegaciones" ADD CONSTRAINT "cat_imss_subdelegaciones_delegacionId_fkey" FOREIGN KEY ("delegacionId") REFERENCES "cat_imss_delegaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_imss_subdelegaciones" ADD CONSTRAINT "cat_imss_subdelegaciones_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_imssRegistroPatronalId_fkey" FOREIGN KEY ("imssRegistroPatronalId") REFERENCES "imss_registro_patronal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_entidadFederativaCode_fkey" FOREIGN KEY ("entidadFederativaCode") REFERENCES "cat_states"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_coloniaId_fkey" FOREIGN KEY ("coloniaId") REFERENCES "cat_colonias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_delegacionId_fkey" FOREIGN KEY ("delegacionId") REFERENCES "cat_imss_delegaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_subdelegacionId_fkey" FOREIGN KEY ("subdelegacionId") REFERENCES "cat_imss_subdelegaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_origenMovimientoId_fkey" FOREIGN KEY ("origenMovimientoId") REFERENCES "cat_imss_origen_movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;