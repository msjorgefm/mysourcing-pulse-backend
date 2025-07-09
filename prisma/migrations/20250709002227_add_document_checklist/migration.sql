-- CreateEnum
CREATE TYPE "SexoTrabajador" AS ENUM ('MASCULINO', 'FEMENINO');

-- CreateEnum
CREATE TYPE "NacionalidadTrabajador" AS ENUM ('MEXICANA', 'EXTRANJERA');

-- CreateEnum
CREATE TYPE "EstadoCivilTrabajador" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE');

-- CreateEnum
CREATE TYPE "RegimenContratacion" AS ENUM ('ASIMILADOS_ACCIONES', 'ASIMILADOS_COMISIONISTAS', 'ASIMILADOS_HONORARIOS', 'ASIMILADOS_INTEGRANTES_SOCIEDADES', 'ASIMILADOS_MIEMBROS_CONSEJOS', 'ASIMILADOS_MIEMBROS_COOPERATIVAS', 'ASIMILADOS_OTROS', 'JUBILADOS', 'SUELDOS');

-- CreateEnum
CREATE TYPE "ZonaGeografica" AS ENUM ('RESTO_PAIS', 'ZONA_FRONTERA_NORTE');

-- CreateEnum
CREATE TYPE "TipoSalario" AS ENUM ('FIJO', 'MIXTO', 'VARIABLE');

-- CreateEnum
CREATE TYPE "ClaseRiesgo" AS ENUM ('CLASE_I', 'CLASE_II', 'CLASE_III', 'CLASE_IV', 'CLASE_V');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('PERIODO_PRUEBA', 'CAPACITACION_INICIAL', 'OBRA_TIEMPO_DETERMINADO', 'TEMPORADA', 'TIEMPO_INDETERMINADO', 'PRACTICAS_PROFESIONALES', 'TELETRABAJO');

-- CreateEnum
CREATE TYPE "TipoTrabajador" AS ENUM ('CONFIANZA', 'PRACTICANTE');

-- CreateEnum
CREATE TYPE "SituacionContractual" AS ENUM ('EVENTUAL', 'EVENTUAL_CONSTRUCCION', 'EVENTUAL_CAMPO', 'PERMANENTE');

-- CreateEnum
CREATE TYPE "TipoJornada" AS ENUM ('DIURNA', 'MIXTA', 'NOCTURNA');

-- CreateEnum
CREATE TYPE "ModalidadTrabajo" AS ENUM ('MIXTO', 'PRESENCIAL', 'TELETRABAJO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TRANSFERENCIA', 'CHEQUE_NOMINATIVO', 'EFECTIVO');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('CONCUBINA', 'CONCUBINO', 'ESPOSA', 'ESPOSO', 'HIJA', 'HIJO', 'MADRE', 'PADRE');

-- CreateEnum
CREATE TYPE "TipoDocumentoFamiliar" AS ENUM ('ACTA_NACIMIENTO', 'ACTA_MATRIMONIO', 'INE');

-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('CUOTA_FIJA', 'PORCENTAJE', 'FACTOR_DESCUENTO');

-- CreateEnum
CREATE TYPE "FormaPagoPension" AS ENUM ('CHEQUE', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('AVISO_RETENCION_INFONAVIT', 'AVISO_SUSPENSION_INFONAVIT', 'CARTA_RECOMENDACION', 'CURP', 'COMPROBANTE_DOMICILIO', 'COMPROBANTE_ESTUDIOS', 'RFC', 'CURRICULUM_VITAE', 'IDENTIFICACION_OFICIAL', 'NSS', 'OFICIO_RETENCION_PENSION', 'SOLICITUD_EMPLEO', 'TARJETA_RESIDENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONSTANCIA_SITUACION_FISCAL', 'ALTA_PATRONAL', 'ALTA_FONACOT', 'SELLOS_DIGITALES', 'CATALOGO_TRABAJADORES', 'PLANTILLA_INCIDENCIAS', 'IDENTIFICACION', 'CUENTA_BANCARIA', 'REPRESENTANTE_LEGAL', 'ACTA_CONSTITUTIVA');

-- AlterTable
ALTER TABLE "fonacot" RENAME CONSTRAINT "company_tax_obligations_pkey" TO "fonacot_pkey";

-- CreateTable
CREATE TABLE "wizard_progress" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "currentSection" INTEGER NOT NULL DEFAULT 1,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wizard_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_progress" (
    "id" SERIAL NOT NULL,
    "wizardProgressId" INTEGER NOT NULL,
    "sectionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_progress" (
    "id" SERIAL NOT NULL,
    "sectionProgressId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizational_areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizational_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizational_departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizational_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizational_positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseSalary" DECIMAL(10,2),
    "hierarchyLevel" TEXT,
    "departmentId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizational_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "workDays" INTEGER[],
    "breakHours" INTEGER,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_details" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "numeroTrabajador" INTEGER NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "sexo" "SexoTrabajador",
    "nacionalidad" "NacionalidadTrabajador",
    "estadoCivil" "EstadoCivilTrabajador" NOT NULL,
    "rfc" VARCHAR(13) NOT NULL,
    "curp" VARCHAR(18) NOT NULL,
    "nss" VARCHAR(11) NOT NULL,
    "umf" INTEGER,
    "fotografia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_addresses" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "correoElectronico" TEXT NOT NULL,
    "telefonoCelular" VARCHAR(10) NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "entidadFederativa" TEXT NOT NULL,
    "municipioAlcaldia" TEXT NOT NULL,
    "colonia" TEXT,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_contract_conditions" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "sucursal" TEXT NOT NULL DEFAULT 'MATRIZ',
    "areaId" INTEGER,
    "departmentId" INTEGER,
    "positionId" INTEGER,
    "regimenContratacion" "RegimenContratacion" NOT NULL,
    "zonaGeografica" "ZonaGeografica" NOT NULL,
    "tipoSalario" "TipoSalario" NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaAntiguedad" TIMESTAMP(3) NOT NULL,
    "salarioDiario" DECIMAL(10,2) NOT NULL,
    "sueldoBaseCotizacion" DECIMAL(10,2) NOT NULL,
    "registroPatronal" TEXT NOT NULL,
    "claseRiesgo" "ClaseRiesgo" NOT NULL,
    "tipoContrato" "TipoContrato" NOT NULL,
    "tipoTrabajador" "TipoTrabajador" NOT NULL,
    "situacionContractual" "SituacionContractual" NOT NULL,
    "duracionContrato" INTEGER,
    "calendarioNomina" TEXT NOT NULL,
    "tipoJornada" "TipoJornada" NOT NULL,
    "horarioId" INTEGER,
    "modalidadTrabajo" "ModalidadTrabajo" NOT NULL,
    "observacion" TEXT,
    "presentaDeclaracionAnual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_contract_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_payment_data" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "institucionFinanciera" TEXT,
    "cuentaBancaria" TEXT,
    "cuentaClabe" VARCHAR(18),
    "numeroTarjeta" VARCHAR(16),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_payment_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_family_members" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "parentesco" "Parentesco" NOT NULL,
    "tipoDocumento" "TipoDocumentoFamiliar",
    "documentoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_alimony" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "numeroJuicio" TEXT NOT NULL,
    "tipoDescuento" "TipoDescuento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "nombreBeneficiario" TEXT NOT NULL,
    "formaPago" "FormaPagoPension" NOT NULL,
    "institucionFinanciera" TEXT,
    "cuentaBancaria" TEXT,
    "cuentaClabe" VARCHAR(18),
    "numeroTarjeta" VARCHAR(16),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_alimony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_infonavit_credits" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "numeroCredito" TEXT NOT NULL,
    "tipoDescuento" "TipoDescuento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaTermino" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_infonavit_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_fonacot_credits" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "numeroCredito" TEXT NOT NULL,
    "tipoDescuento" "TipoDescuento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaTermino" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_fonacot_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_documents" (
    "id" SERIAL NOT NULL,
    "workerDetailsId" INTEGER NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "nombreDocumento" TEXT,
    "documentoUrl" TEXT NOT NULL,
    "fechaModificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_document_checklist" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "constanciaSituacionFiscal" BOOLEAN NOT NULL DEFAULT false,
    "altaPatronal" BOOLEAN NOT NULL DEFAULT false,
    "altaFonacot" BOOLEAN NOT NULL DEFAULT false,
    "sellosDigitales" BOOLEAN NOT NULL DEFAULT false,
    "catalogoTrabajadores" BOOLEAN NOT NULL DEFAULT false,
    "plantillaIncidencias" BOOLEAN NOT NULL DEFAULT false,
    "identificacion" BOOLEAN NOT NULL DEFAULT false,
    "cuentaBancaria" BOOLEAN NOT NULL DEFAULT false,
    "representanteLegal" BOOLEAN NOT NULL DEFAULT false,
    "actaConstitutiva" BOOLEAN NOT NULL DEFAULT false,
    "allDocumentsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_document_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_documents" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" "UserRole" NOT NULL,
    "uploadedByUserId" INTEGER NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wizard_progress_companyId_key" ON "wizard_progress"("companyId");

-- CreateIndex
CREATE INDEX "section_progress_wizardProgressId_idx" ON "section_progress"("wizardProgressId");

-- CreateIndex
CREATE INDEX "step_progress_sectionProgressId_idx" ON "step_progress"("sectionProgressId");

-- CreateIndex
CREATE INDEX "organizational_areas_companyId_idx" ON "organizational_areas"("companyId");

-- CreateIndex
CREATE INDEX "organizational_departments_companyId_idx" ON "organizational_departments"("companyId");

-- CreateIndex
CREATE INDEX "organizational_departments_areaId_idx" ON "organizational_departments"("areaId");

-- CreateIndex
CREATE INDEX "organizational_positions_companyId_idx" ON "organizational_positions"("companyId");

-- CreateIndex
CREATE INDEX "organizational_positions_departmentId_idx" ON "organizational_positions"("departmentId");

-- CreateIndex
CREATE INDEX "work_schedules_companyId_idx" ON "work_schedules"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_details_employeeId_key" ON "worker_details"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_details_companyId_numeroTrabajador_key" ON "worker_details"("companyId", "numeroTrabajador");

-- CreateIndex
CREATE UNIQUE INDEX "worker_details_companyId_rfc_key" ON "worker_details"("companyId", "rfc");

-- CreateIndex
CREATE UNIQUE INDEX "worker_details_companyId_curp_key" ON "worker_details"("companyId", "curp");

-- CreateIndex
CREATE UNIQUE INDEX "worker_addresses_workerDetailsId_key" ON "worker_addresses"("workerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_contract_conditions_workerDetailsId_key" ON "worker_contract_conditions"("workerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_payment_data_workerDetailsId_key" ON "worker_payment_data"("workerDetailsId");

-- CreateIndex
CREATE INDEX "worker_family_members_workerDetailsId_idx" ON "worker_family_members"("workerDetailsId");

-- CreateIndex
CREATE INDEX "worker_alimony_workerDetailsId_idx" ON "worker_alimony"("workerDetailsId");

-- CreateIndex
CREATE INDEX "worker_infonavit_credits_workerDetailsId_idx" ON "worker_infonavit_credits"("workerDetailsId");

-- CreateIndex
CREATE INDEX "worker_fonacot_credits_workerDetailsId_idx" ON "worker_fonacot_credits"("workerDetailsId");

-- CreateIndex
CREATE INDEX "worker_documents_workerDetailsId_idx" ON "worker_documents"("workerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "company_document_checklist_companyId_key" ON "company_document_checklist"("companyId");

-- CreateIndex
CREATE INDEX "company_documents_companyId_idx" ON "company_documents"("companyId");

-- RenameForeignKey
ALTER TABLE "fonacot" RENAME CONSTRAINT "company_tax_obligations_companyId_fkey" TO "fonacot_companyId_fkey";

-- AddForeignKey
ALTER TABLE "wizard_progress" ADD CONSTRAINT "wizard_progress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_progress" ADD CONSTRAINT "section_progress_wizardProgressId_fkey" FOREIGN KEY ("wizardProgressId") REFERENCES "wizard_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_sectionProgressId_fkey" FOREIGN KEY ("sectionProgressId") REFERENCES "section_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_areas" ADD CONSTRAINT "organizational_areas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_departments" ADD CONSTRAINT "organizational_departments_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "organizational_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_departments" ADD CONSTRAINT "organizational_departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_positions" ADD CONSTRAINT "organizational_positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "organizational_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_positions" ADD CONSTRAINT "organizational_positions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_details" ADD CONSTRAINT "worker_details_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_details" ADD CONSTRAINT "worker_details_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_addresses" ADD CONSTRAINT "worker_addresses_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "organizational_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "organizational_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "organizational_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "work_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_payment_data" ADD CONSTRAINT "worker_payment_data_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_family_members" ADD CONSTRAINT "worker_family_members_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_alimony" ADD CONSTRAINT "worker_alimony_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_infonavit_credits" ADD CONSTRAINT "worker_infonavit_credits_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_fonacot_credits" ADD CONSTRAINT "worker_fonacot_credits_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_documents" ADD CONSTRAINT "worker_documents_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_document_checklist" ADD CONSTRAINT "company_document_checklist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "company_tax_obligations_companyId_key" RENAME TO "fonacot_companyId_key";
