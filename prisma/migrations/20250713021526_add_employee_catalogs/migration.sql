-- CreateTable
CREATE TABLE "cat_modalidad_trabajo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_modalidad_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tipo_jornada" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tipo_jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_situacion_contractual" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_situacion_contractual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tipo_trabajador" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tipo_trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tipo_salario" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tipo_salario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_zona_geografica" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_zona_geografica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tipo_contrato" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tipo_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_modalidad_trabajo_codigo_key" ON "cat_modalidad_trabajo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tipo_jornada_codigo_key" ON "cat_tipo_jornada"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_situacion_contractual_codigo_key" ON "cat_situacion_contractual"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tipo_trabajador_codigo_key" ON "cat_tipo_trabajador"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tipo_salario_codigo_key" ON "cat_tipo_salario"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_zona_geografica_codigo_key" ON "cat_zona_geografica"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tipo_contrato_codigo_key" ON "cat_tipo_contrato"("codigo");
