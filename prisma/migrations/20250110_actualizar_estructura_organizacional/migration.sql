-- Eliminar tablas antiguas si existen
DROP TABLE IF EXISTS "company_positions";
DROP TABLE IF EXISTS "company_departments";
DROP TABLE IF EXISTS "company_areas";

-- Crear tabla de áreas
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- Crear tabla de departamentos
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- Crear tabla de puestos
CREATE TABLE "puestos" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "departamentoId" INTEGER,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "salarioMinimo" DECIMAL(10,2),
    "salarioMaximo" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- Crear índices únicos
CREATE UNIQUE INDEX "areas_empresaId_nombre_key" ON "areas"("empresaId", "nombre");
CREATE UNIQUE INDEX "departamentos_empresaId_nombre_key" ON "departamentos"("empresaId", "nombre");
CREATE UNIQUE INDEX "puestos_empresaId_nombre_key" ON "puestos"("empresaId", "nombre");

-- Agregar claves foráneas
ALTER TABLE "areas" ADD CONSTRAINT "areas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "puestos" ADD CONSTRAINT "puestos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;