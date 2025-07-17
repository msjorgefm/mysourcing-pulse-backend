-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPERATOR', 'CLIENT', 'EMPLOYEE', 'ADMIN', 'DEPARTMENT_HEAD');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('IN_SETUP', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDEFINITE', 'FIXED_TERM', 'PART_TIME', 'CONTRACTOR', 'INTERN');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'PENDING_AUTHORIZATION', 'AUTHORIZED', 'PROCESSED', 'TIMBERED', 'ERROR');

-- CreateEnum
CREATE TYPE "CFDIStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "IncidenceType" AS ENUM ('FALTAS', 'PERMISOS', 'VACACIONES', 'TIEMPO_EXTRA', 'BONOS');

-- CreateEnum
CREATE TYPE "IncidenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYROLL_PENDING_AUTHORIZATION', 'PAYROLL_APPROVED', 'PAYROLL_REJECTED', 'PAYROLL_TIMBERED', 'SYSTEM_ALERT', 'REMINDER', 'CHECKLIST_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WizardStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('CHECKING', 'SAVINGS', 'PAYROLL');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'DAYS', 'HOURS');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('ATTENDANCE', 'VACATION', 'REMOTE_WORK', 'CODE_OF_CONDUCT', 'OTHER');

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

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rfc" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "hireDate" TIMESTAMP(3) NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "workSchedule" TEXT,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "phone" TEXT,
    "emergencyContact" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "clabe" TEXT,
    "taxRegime" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendars" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "workDays" JSONB NOT NULL,
    "holidays" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_calendars" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "payFrequency" TEXT NOT NULL,
    "daysBeforeClose" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "periodNumber" INTEGER NOT NULL DEFAULT 1,
    "payNaturalDays" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "totalGross" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "totalNet" DECIMAL(12,2) NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "authorizedBy" TEXT,
    "xmlPath" TEXT,
    "pdfPath" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" SERIAL NOT NULL,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "overtime" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonuses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalGross" DECIMAL(10,2) NOT NULL,
    "incomeTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "socialSecurity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "workedDays" INTEGER NOT NULL,
    "cfdiStatus" "CFDIStatus" NOT NULL DEFAULT 'PENDING',
    "cfdiUuid" TEXT,
    "cfdiXmlPath" TEXT,
    "cfdiPdfPath" TEXT,
    "employeeId" INTEGER NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidences" (
    "id" SERIAL NOT NULL,
    "type" "IncidenceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "status" "IncidenceStatus" NOT NULL DEFAULT 'PENDING',
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "payrollId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "companyId" INTEGER,
    "payrollId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tax_regimes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tipoPersona" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_tax_regimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_economic_activities" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_economic_activities_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "cat_states" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_identification_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_identification_types_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "clase_riesgo_imss" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clase_riesgo_imss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "invitationSentAt" BOOLEAN NOT NULL DEFAULT false,
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

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'IN_SETUP',
    "employeesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_wizards" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "status" "WizardStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentSection" INTEGER NOT NULL DEFAULT 1,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "wizardData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_wizard_sections" (
    "id" SERIAL NOT NULL,
    "wizardId" INTEGER NOT NULL,
    "sectionNumber" INTEGER NOT NULL,
    "sectionName" TEXT NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'PENDING',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizard_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_wizard_steps" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "stepData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "company_wizard_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_general_info" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "businessName" VARCHAR(100) NOT NULL,
    "commercialName" TEXT,
    "rfc" TEXT NOT NULL,
    "tipoPersona" TEXT,
    "actividadEconomica" TEXT,
    "taxRegime" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_general_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_address" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "tipoDomicilio" TEXT NOT NULL DEFAULT 'matriz',
    "nombreSucursal" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "exteriorNumber" TEXT NOT NULL,
    "interiorNumber" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "municipio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_legal_representative" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "primerApellido" TEXT,
    "segundoApellido" TEXT,
    "tipoIdentificacionId" INTEGER,
    "uriIdentificacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_legal_representative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_notarial_power" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "folioPoderNotarial" VARCHAR(25),
    "fechaEmision" TIMESTAMP(3),
    "fechaVigencia" TIMESTAMP(3),
    "nombreFederatario" TEXT,
    "numeroFederatario" INTEGER,
    "estadoId" INTEGER,
    "municipioId" INTEGER,
    "uriPoderNotarial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_notarial_power_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imss_registro_patronal" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "nomDomicilio" TEXT,
    "actividadEconomica" TEXT,
    "clvRegistroPatronal" TEXT,
    "claseRiesgoId" INTEGER,
    "numFraccion" INTEGER,
    "numPrismaRiesgo" DECIMAL(5,2),
    "fechaVigencia" TIMESTAMP(3),
    "uriRegistroPatronal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imss_registro_patronal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fonacot" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "registroPatronal" VARCHAR(7),
    "fechaAfiliacion" TIMESTAMP(3),
    "uriArchivoFonacot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fonacot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_banks" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "nombreCorto" VARCHAR(50),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cat_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_banks" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "nomCuentaBancaria" TEXT NOT NULL,
    "numCuentaBancaria" TEXT NOT NULL,
    "numClabeInterbancaria" VARCHAR(18) NOT NULL,
    "numSucursal" VARCHAR(6),
    "clvDispersion" INTEGER,
    "desCuentaBancaria" TEXT,
    "opcCuentaBancariaPrincipal" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_digital_certificates" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "certificateFile" TEXT NOT NULL,
    "keyFile" TEXT NOT NULL,
    "password" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_digital_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "puestos" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "departamentoId" INTEGER,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_benefits" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BenefitType" NOT NULL,
    "isLegal" BOOLEAN NOT NULL DEFAULT false,
    "percentage" DECIMAL(5,2),
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_benefit_groups" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "benefits" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_benefit_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_schedules" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakTime" INTEGER,
    "workDays" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_email_isActive_idx" ON "users"("email", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokens_token_key" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_token_used_idx" ON "invitation_tokens"("token", "used");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_rfc_key" ON "employees"("rfc");

-- CreateIndex
CREATE INDEX "employees_companyId_status_idx" ON "employees"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "calendars_companyId_year_key" ON "calendars"("companyId", "year");

-- CreateIndex
CREATE INDEX "payrolls_companyId_status_idx" ON "payrolls"("companyId", "status");

-- CreateIndex
CREATE INDEX "payrolls_periodStart_periodEnd_idx" ON "payrolls"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_items_employeeId_payrollId_key" ON "payroll_items"("employeeId", "payrollId");

-- CreateIndex
CREATE INDEX "incidences_companyId_date_idx" ON "incidences"("companyId", "date");

-- CreateIndex
CREATE INDEX "incidences_employeeId_type_idx" ON "incidences"("employeeId", "type");

-- CreateIndex
CREATE INDEX "notifications_companyId_read_idx" ON "notifications"("companyId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tax_regimes_code_key" ON "cat_tax_regimes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cat_economic_activities_code_key" ON "cat_economic_activities"("code");

-- CreateIndex
CREATE INDEX "cat_postal_codes_postalCode_idx" ON "cat_postal_codes"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "cat_states_code_key" ON "cat_states"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cat_identification_types_code_key" ON "cat_identification_types"("code");

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
CREATE INDEX "cat_colonias_municipioCode_idx" ON "cat_colonias"("municipioCode");

-- CreateIndex
CREATE INDEX "cat_colonias_stateCode_idx" ON "cat_colonias"("stateCode");

-- CreateIndex
CREATE INDEX "cat_colonias_cityName_idx" ON "cat_colonias"("cityName");

-- CreateIndex
CREATE UNIQUE INDEX "clase_riesgo_imss_codigo_key" ON "clase_riesgo_imss"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_delegaciones_codigo_key" ON "cat_imss_delegaciones"("codigo");

-- CreateIndex
CREATE INDEX "cat_imss_delegaciones_entidadFederativaCode_idx" ON "cat_imss_delegaciones"("entidadFederativaCode");

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_subdelegaciones_codigo_key" ON "cat_imss_subdelegaciones"("codigo");

-- CreateIndex
CREATE INDEX "cat_imss_subdelegaciones_delegacionId_idx" ON "cat_imss_subdelegaciones"("delegacionId");

-- CreateIndex
CREATE INDEX "cat_imss_subdelegaciones_municipioCode_idx" ON "cat_imss_subdelegaciones"("municipioCode");

-- CreateIndex
CREATE UNIQUE INDEX "cat_imss_origen_movimiento_codigo_key" ON "cat_imss_origen_movimiento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "imss_domicilio_imssRegistroPatronalId_key" ON "imss_domicilio"("imssRegistroPatronalId");

-- CreateIndex
CREATE UNIQUE INDEX "wizard_progress_companyId_key" ON "wizard_progress"("companyId");

-- CreateIndex
CREATE INDEX "section_progress_wizardProgressId_idx" ON "section_progress"("wizardProgressId");

-- CreateIndex
CREATE INDEX "step_progress_sectionProgressId_idx" ON "step_progress"("sectionProgressId");

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

-- CreateIndex
CREATE UNIQUE INDEX "companies_rfc_key" ON "companies"("rfc");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "company_wizards_companyId_key" ON "company_wizards"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_wizard_sections_wizardId_sectionNumber_key" ON "company_wizard_sections"("wizardId", "sectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "company_wizard_steps_sectionId_stepNumber_key" ON "company_wizard_steps"("sectionId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "company_general_info_companyId_key" ON "company_general_info"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_address_companyId_key" ON "company_address"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_legal_representative_companyId_key" ON "company_legal_representative"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_notarial_power_companyId_key" ON "company_notarial_power"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "imss_registro_patronal_companyId_key" ON "imss_registro_patronal"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "fonacot_companyId_key" ON "fonacot"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_banks_codigo_key" ON "cat_banks"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "company_banks_companyId_key" ON "company_banks"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_digital_certificates_companyId_key" ON "company_digital_certificates"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "areas_empresaId_nombre_key" ON "areas"("empresaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_empresaId_nombre_key" ON "departamentos"("empresaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "puestos_empresaId_nombre_key" ON "puestos"("empresaId", "nombre");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_calendars" ADD CONSTRAINT "payroll_calendars_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidences" ADD CONSTRAINT "incidences_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "cat_imss_delegaciones" ADD CONSTRAINT "cat_imss_delegaciones_entidadFederativaCode_fkey" FOREIGN KEY ("entidadFederativaCode") REFERENCES "cat_states"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_imss_subdelegaciones" ADD CONSTRAINT "cat_imss_subdelegaciones_delegacionId_fkey" FOREIGN KEY ("delegacionId") REFERENCES "cat_imss_delegaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_imss_subdelegaciones" ADD CONSTRAINT "cat_imss_subdelegaciones_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_coloniaId_fkey" FOREIGN KEY ("coloniaId") REFERENCES "cat_colonias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_delegacionId_fkey" FOREIGN KEY ("delegacionId") REFERENCES "cat_imss_delegaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_entidadFederativaCode_fkey" FOREIGN KEY ("entidadFederativaCode") REFERENCES "cat_states"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_imssRegistroPatronalId_fkey" FOREIGN KEY ("imssRegistroPatronalId") REFERENCES "imss_registro_patronal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_municipioCode_fkey" FOREIGN KEY ("municipioCode") REFERENCES "cat_municipios"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_origenMovimientoId_fkey" FOREIGN KEY ("origenMovimientoId") REFERENCES "cat_imss_origen_movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_domicilio" ADD CONSTRAINT "imss_domicilio_subdelegacionId_fkey" FOREIGN KEY ("subdelegacionId") REFERENCES "cat_imss_subdelegaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wizard_progress" ADD CONSTRAINT "wizard_progress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_progress" ADD CONSTRAINT "section_progress_wizardProgressId_fkey" FOREIGN KEY ("wizardProgressId") REFERENCES "wizard_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_sectionProgressId_fkey" FOREIGN KEY ("sectionProgressId") REFERENCES "section_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;




-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_details" ADD CONSTRAINT "worker_details_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_details" ADD CONSTRAINT "worker_details_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_addresses" ADD CONSTRAINT "worker_addresses_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "work_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "puestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_contract_conditions" ADD CONSTRAINT "worker_contract_conditions_workerDetailsId_fkey" FOREIGN KEY ("workerDetailsId") REFERENCES "worker_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "company_wizards" ADD CONSTRAINT "company_wizards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_wizard_sections" ADD CONSTRAINT "company_wizard_sections_wizardId_fkey" FOREIGN KEY ("wizardId") REFERENCES "company_wizards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_wizard_steps" ADD CONSTRAINT "company_wizard_steps_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "company_wizard_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_general_info" ADD CONSTRAINT "company_general_info_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_address" ADD CONSTRAINT "company_address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_legal_representative" ADD CONSTRAINT "company_legal_representative_tipoIdentificacionId_fkey" FOREIGN KEY ("tipoIdentificacionId") REFERENCES "cat_identification_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "cat_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notarial_power" ADD CONSTRAINT "company_notarial_power_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "cat_municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_registro_patronal" ADD CONSTRAINT "imss_registro_patronal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imss_registro_patronal" ADD CONSTRAINT "imss_registro_patronal_claseRiesgoId_fkey" FOREIGN KEY ("claseRiesgoId") REFERENCES "clase_riesgo_imss"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fonacot" ADD CONSTRAINT "fonacot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_banks" ADD CONSTRAINT "company_banks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_banks" ADD CONSTRAINT "company_banks_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "cat_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_digital_certificates" ADD CONSTRAINT "company_digital_certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_benefits" ADD CONSTRAINT "company_benefits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_benefit_groups" ADD CONSTRAINT "company_benefit_groups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_schedules" ADD CONSTRAINT "company_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policies" ADD CONSTRAINT "company_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
