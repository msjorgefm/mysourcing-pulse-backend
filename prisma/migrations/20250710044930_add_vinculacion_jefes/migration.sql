-- DropForeignKey
ALTER TABLE "company_notarial_power" DROP CONSTRAINT "company_notarial_power_estadoId_fkey";

-- DropForeignKey
ALTER TABLE "company_notarial_power" DROP CONSTRAINT "company_notarial_power_municipioId_fkey";

-- CreateTable
CREATE TABLE "vinculacion_jefes" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vinculacion_jefes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculacion_jefe_areas" (
    "id" SERIAL NOT NULL,
    "vinculacionJefeId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vinculacion_jefe_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculacion_jefe_departamentos" (
    "id" SERIAL NOT NULL,
    "vinculacionJefeId" INTEGER NOT NULL,
    "departamentoId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vinculacion_jefe_departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculacion_jefe_puestos" (
    "id" SERIAL NOT NULL,
    "vinculacionJefeId" INTEGER NOT NULL,
    "puestoId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vinculacion_jefe_puestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculacion_jefe_empleados" (
    "id" SERIAL NOT NULL,
    "vinculacionJefeId" INTEGER NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vinculacion_jefe_empleados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefes_empleadoId_key" ON "vinculacion_jefes"("empleadoId");

-- CreateIndex
CREATE INDEX "vinculacion_jefes_empresaId_idx" ON "vinculacion_jefes"("empresaId");

-- CreateIndex
CREATE INDEX "vinculacion_jefes_usuarioId_idx" ON "vinculacion_jefes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefe_areas_vinculacionJefeId_areaId_key" ON "vinculacion_jefe_areas"("vinculacionJefeId", "areaId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefe_departamentos_vinculacionJefeId_departamen_key" ON "vinculacion_jefe_departamentos"("vinculacionJefeId", "departamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefe_puestos_vinculacionJefeId_puestoId_key" ON "vinculacion_jefe_puestos"("vinculacionJefeId", "puestoId");

-- CreateIndex
CREATE INDEX "vinculacion_jefe_empleados_empleadoId_idx" ON "vinculacion_jefe_empleados"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculacion_jefe_empleados_vinculacionJefeId_empleadoId_key" ON "vinculacion_jefe_empleados"("vinculacionJefeId", "empleadoId");

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "cat_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "cat_municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefes" ADD CONSTRAINT "vinculacion_jefes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefes" ADD CONSTRAINT "vinculacion_jefes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefes" ADD CONSTRAINT "vinculacion_jefes_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_areas" ADD CONSTRAINT "vinculacion_jefe_areas_vinculacionJefeId_fkey" FOREIGN KEY ("vinculacionJefeId") REFERENCES "vinculacion_jefes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_areas" ADD CONSTRAINT "vinculacion_jefe_areas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "organizational_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_departamentos" ADD CONSTRAINT "vinculacion_jefe_departamentos_vinculacionJefeId_fkey" FOREIGN KEY ("vinculacionJefeId") REFERENCES "vinculacion_jefes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_departamentos" ADD CONSTRAINT "vinculacion_jefe_departamentos_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "organizational_departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_puestos" ADD CONSTRAINT "vinculacion_jefe_puestos_vinculacionJefeId_fkey" FOREIGN KEY ("vinculacionJefeId") REFERENCES "vinculacion_jefes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_puestos" ADD CONSTRAINT "vinculacion_jefe_puestos_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "organizational_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_empleados" ADD CONSTRAINT "vinculacion_jefe_empleados_vinculacionJefeId_fkey" FOREIGN KEY ("vinculacionJefeId") REFERENCES "vinculacion_jefes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculacion_jefe_empleados" ADD CONSTRAINT "vinculacion_jefe_empleados_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
